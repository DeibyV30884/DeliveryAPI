using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class PedidoService : IPedidoService
{
    private readonly IAppDbContext _context;
    private readonly ICalculadorCostosPedido _calculadorCostos;

    public PedidoService(IAppDbContext context, ICalculadorCostosPedido calculadorCostos)
    {
        _context = context;
        _calculadorCostos = calculadorCostos;
    }

    public async Task<ServiceResult> PrevisualizarPedido(int usuarioId, PrevisualizarPedidoDto dto)
    {
        var cliente = await ObtenerClienteActivo(usuarioId);
        if (cliente == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        var (error, restaurante, productos) = await ValidarRestauranteYProductos(dto.RestauranteId, dto.Productos);
        if (error != null) return error;

        var calculo = _calculadorCostos.Calcular(restaurante!, productos!, dto.Productos, dto.LatitudEntrega, dto.LongitudEntrega);

        return ServiceResult.Ok(new
        {
            calculo.Subtotal,
            calculo.CostoEnvio,
            calculo.Total,
            calculo.DistanciaKm,
            calculo.TiempoEstimadoMin,
            SaldoDisponible = cliente.Saldo,
            SaldoSuficiente = cliente.Saldo >= calculo.Total
        });
    }

    public async Task<ServiceResult> CrearPedido(int usuarioId, CrearPedidoDto dto)
    {
        var cliente = await ObtenerClienteActivo(usuarioId);
        if (cliente == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        var (error, restaurante, productos) = await ValidarRestauranteYProductos(dto.RestauranteId, dto.Productos);
        if (error != null) return error;

        var calculo = _calculadorCostos.Calcular(restaurante!, productos!, dto.Productos, dto.LatitudEntrega, dto.LongitudEntrega);

        if (cliente.Saldo < calculo.Total)
            return ServiceResult.Fallo($"Saldo insuficiente. Saldo disponible: ₡{cliente.Saldo:N0}, Total del pedido: ₡{calculo.Total:N0}");

        var pedido = new Pedido
        {
            ClienteId = cliente.ClienteId,
            RestauranteId = dto.RestauranteId,
            DireccionEntrega = dto.DireccionEntrega,
            LatitudEntrega = dto.LatitudEntrega,
            LongitudEntrega = dto.LongitudEntrega,
            Estado = "Pendiente",
            CodigoConfirmacion = new Random().Next(100000, 999999).ToString(),
            Subtotal = calculo.Subtotal,
            ComisionPlataforma = calculo.ComisionPlataforma,
            CostoEnvio = calculo.CostoEnvio,
            Total = calculo.Total,
            DistanciaKm = calculo.DistanciaKm,
            TiempoEstimadoMin = calculo.TiempoEstimadoMin,
            NotaCliente = dto.NotaCliente,
            FechaPedido = DateTime.Now
        };

        _context.Pedidos.Add(pedido);
        await _context.SaveChangesAsync();

        foreach (var detalle in calculo.Detalles)
        {
            detalle.PedidoId = pedido.PedidoId;
            _context.DetallesPedido.Add(detalle);
        }

        cliente.Saldo -= calculo.Total;
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new
        {
            pedido.PedidoId,
            pedido.CodigoConfirmacion,
            pedido.Subtotal,
            pedido.CostoEnvio,
            pedido.ComisionPlataforma,
            pedido.Total,
            pedido.DistanciaKm,
            pedido.TiempoEstimadoMin,
            pedido.Estado,
            SaldoRestante = cliente.Saldo
        });
    }

    public async Task<ServiceResult> ObtenerSeguimientoPedido(int pedidoId, int usuarioId)
    {
        var cliente = await ObtenerClienteActivo(usuarioId);
        if (cliente == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        var pedido = await _context.Pedidos
            .Include(p => p.Restaurante)
            .Include(p => p.Repartidor)
            .FirstOrDefaultAsync(p => p.PedidoId == pedidoId && p.ClienteId == cliente.ClienteId);

        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        object? repartidorInfo = null;

        if (pedido.Repartidor != null)
        {
            // Valores por defecto: si todavía no está "EnCamino", no simulamos movimiento
            double latActual = (double)pedido.Restaurante!.Latitud;
            double lngActual = (double)pedido.Restaurante.Longitud;
            double tiempoRestanteMin = pedido.TiempoEstimadoMin;
            double fraccion = 0;
            bool yaLlego = false;

            if (pedido.Estado == "EnCamino" && pedido.FechaInicioEnCamino.HasValue)
            {
                var minutosTranscurridos = (DateTime.Now - pedido.FechaInicioEnCamino.Value).TotalMinutes;
                var distanciaRecorridaKm = 35.0 * (minutosTranscurridos / 60.0);

                // Duración real del viaje a 35 km/h — no usamos el TiempoEstimadoMin original,
                // porque ese incluye tiempo de preparación del restaurante y no coincide con
                // la velocidad fija que usa la simulación del mapa.
                double duracionViajeMin = 0;
                if (pedido.DistanciaKm > 0)
                    duracionViajeMin = (double)pedido.DistanciaKm / 35.0 * 60.0;

                if (pedido.DistanciaKm > 0)
                    fraccion = distanciaRecorridaKm / (double)pedido.DistanciaKm;
                if (fraccion > 1) fraccion = 1;
                if (fraccion < 0) fraccion = 0;

                var latOrigen = (double)pedido.Restaurante.Latitud;
                var lngOrigen = (double)pedido.Restaurante.Longitud;
                var latDestino = (double)pedido.LatitudEntrega;
                var lngDestino = (double)pedido.LongitudEntrega;

                latActual = latOrigen + fraccion * (latDestino - latOrigen);
                lngActual = lngOrigen + fraccion * (lngDestino - lngOrigen);

                // Se descuenta contra la duración real del viaje, no contra el estimado original
                tiempoRestanteMin = duracionViajeMin - minutosTranscurridos;
                if (tiempoRestanteMin < 0) tiempoRestanteMin = 0;

                yaLlego = fraccion >= 1;
            }

            repartidorInfo = new
            {
                pedido.Repartidor.RepartidorId,
                LatitudActual = latActual,
                LongitudActual = lngActual,
                TiempoRestanteMin = Math.Round(tiempoRestanteMin),
                Fraccion = fraccion,
                YaLlego = yaLlego
            };
        }

        return ServiceResult.Ok(new
        {
            pedido.PedidoId,
            pedido.Estado,
            pedido.CodigoConfirmacion,
            pedido.DistanciaKm,
            pedido.TiempoEstimadoMin,
            pedido.FechaPedido,
            pedido.FechaEntrega,
            pedido.DireccionEntrega,
            pedido.LatitudEntrega,
            pedido.LongitudEntrega,
            pedido.Total,
            Restaurante = pedido.Restaurante == null ? null : new
            {
                pedido.Restaurante.RestauranteId,
                pedido.Restaurante.NombreRestaurante,
                pedido.Restaurante.Latitud,
                pedido.Restaurante.Longitud
            },
            Repartidor = repartidorInfo
        });
    }

    public async Task<ServiceResult> ObtenerHistorialCliente(int usuarioId)
    {
        var cliente = await ObtenerClienteActivo(usuarioId);
        if (cliente == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        var pedidos = await _context.Pedidos
            .Where(p => p.ClienteId == cliente.ClienteId)
            .OrderByDescending(p => p.FechaPedido)
            .Select(p => new
            {
                p.PedidoId,
                p.Estado,
                p.Total,
                p.FechaPedido,
                p.FechaEntrega,
                p.DireccionEntrega,
                NombreRestaurante = p.Restaurante!.NombreRestaurante,
                Productos = p.DetallesPedido.Select(d => new { d.Producto!.Nombre, d.Cantidad, d.PrecioUnitario, d.Subtotal })
            })
            .ToListAsync();

        return ServiceResult.Ok(pedidos);
    }

    private async Task<Cliente?> ObtenerClienteActivo(int usuarioId) =>
        await _context.Clientes.FirstOrDefaultAsync(c => c.UsuarioId == usuarioId && c.Activo);

    private async Task<(ServiceResult? error, Restaurante? restaurante, List<Producto>? productos)> ValidarRestauranteYProductos(
        int restauranteId, List<DetallePedidoDto> itemsSolicitados)
    {
        var restaurante = await _context.Restaurantes.FirstOrDefaultAsync(r => r.RestauranteId == restauranteId && r.Activo);
        if (restaurante == null)
            return (ServiceResult.Fallo("Restaurante no encontrado o inactivo"), null, null);

        if (!itemsSolicitados.Any())
            return (ServiceResult.Fallo("El pedido debe tener al menos un producto"), null, null);

        var idsProductos = itemsSolicitados.Select(p => p.ProductoId).Distinct().ToList();
        var productos = await _context.Productos
            .Where(p => idsProductos.Contains(p.ProductoId) && p.Activo && p.RestauranteId == restauranteId)
            .ToListAsync();

        if (productos.Count != idsProductos.Count)
            return (ServiceResult.Fallo("Uno o más productos no son válidos para este restaurante"), null, null);

        return (null, restaurante, productos);
    }
}