using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class PedidoService : IPedidoService
{
    private readonly IAppDbContext _context;

    public PedidoService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult> CrearPedido(int clienteId, CrearPedidoDto dto)
    {
        // Verificar que el cliente existe y está activo
        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.ClienteId == clienteId && c.Activo);
        if (cliente == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        // Verificar que el restaurante existe y está activo
        var restaurante = await _context.Restaurantes
            .FirstOrDefaultAsync(r => r.RestauranteId == dto.RestauranteId && r.Activo);
        if (restaurante == null)
            return ServiceResult.Fallo("Restaurante no encontrado o inactivo");

        // Verificar que los productos existen y pertenecen al restaurante
        if (!dto.Productos.Any())
            return ServiceResult.Fallo("El pedido debe tener al menos un producto");

        var productosIds = dto.Productos.Select(p => p.ProductoId).ToList();
        var productos = await _context.Productos
            .Where(p => productosIds.Contains(p.ProductoId) && p.Activo && p.RestauranteId == dto.RestauranteId)
            .ToListAsync();

        if (productos.Count != dto.Productos.Count)
            return ServiceResult.Fallo("Uno o más productos no son válidos para este restaurante");

        // Calcular subtotal
        decimal subtotal = 0;
        int tiempoPreparacion = 0;
        var detalles = new List<DetallePedido>();

        foreach (var item in dto.Productos)
        {
            var producto = productos.First(p => p.ProductoId == item.ProductoId);
            decimal precioFinal = producto.PrecioDescuento ?? producto.Precio;
            decimal subtotalLinea = precioFinal * item.Cantidad;
            subtotal += subtotalLinea;

            if (producto.TiempoPreparacionMin > tiempoPreparacion)
                tiempoPreparacion = producto.TiempoPreparacionMin;

            detalles.Add(new DetallePedido
            {
                ProductoId = item.ProductoId,
                Cantidad = item.Cantidad,
                PrecioUnitario = precioFinal,
                Subtotal = subtotalLinea
            });
        }

        // Calcular distancia con fórmula Haversine
        decimal distanciaKm = CalcularDistanciaHaversine(
            (double)restaurante.Latitud, (double)restaurante.Longitud,
            (double)dto.LatitudEntrega, (double)dto.LongitudEntrega);

        // Calcular costos
        decimal costoEnvio = distanciaKm * 700;
        decimal comision = subtotal * 0.05m;
        decimal total = subtotal + costoEnvio;
        int tiempoViaje = (int)((double)distanciaKm / 35 * 60);
        int tiempoEstimado = tiempoPreparacion + tiempoViaje;

        // Verificar saldo suficiente
        if (cliente.Saldo < total)
            return ServiceResult.Fallo($"Saldo insuficiente. Saldo disponible: ₡{cliente.Saldo:N0}, Total del pedido: ₡{total:N0}");

        // Generar código de confirmación
        string codigo = new Random().Next(100000, 999999).ToString();

        // Crear el pedido
        var pedido = new Pedido
        {
            ClienteId = clienteId,
            RestauranteId = dto.RestauranteId,
            DireccionEntrega = dto.DireccionEntrega,
            LatitudEntrega = dto.LatitudEntrega,
            LongitudEntrega = dto.LongitudEntrega,
            Estado = "Pendiente",
            CodigoConfirmacion = codigo,
            Subtotal = subtotal,
            ComisionPlataforma = comision,
            CostoEnvio = costoEnvio,
            Total = total,
            DistanciaKm = distanciaKm,
            TiempoEstimadoMin = tiempoEstimado,
            NotaCliente = dto.NotaCliente,
            FechaPedido = DateTime.Now
        };

        _context.Pedidos.Add(pedido);
        await _context.SaveChangesAsync();

        // Guardar detalles
        foreach (var detalle in detalles)
        {
            detalle.PedidoId = pedido.PedidoId;
            _context.DetallesPedido.Add(detalle);
        }

        // Descontar saldo al cliente
        cliente.Saldo -= total;
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

    public async Task<ServiceResult> ObtenerSeguimientoPedido(int pedidoId, int clienteId)
    {
        var pedido = await _context.Pedidos
            .Where(p => p.PedidoId == pedidoId && p.ClienteId == clienteId)
            .Select(p => new
            {
                p.PedidoId,
                p.Estado,
                p.CodigoConfirmacion,
                p.TiempoEstimadoMin,
                p.FechaPedido,
                p.FechaEntrega,
                p.DireccionEntrega,
                p.LatitudEntrega,
                p.LongitudEntrega,
                p.Total,
                Restaurante = new
                {
                    p.Restaurante.RestauranteId,
                    p.Restaurante.NombreRestaurante,
                    p.Restaurante.Latitud,
                    p.Restaurante.Longitud
                },
                Repartidor = p.Repartidor == null ? null : new
                {
                    p.Repartidor.RepartidorId,
                    p.Repartidor.LatitudActual,
                    p.Repartidor.LongitudActual
                }
            })
            .FirstOrDefaultAsync();

        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        return ServiceResult.Ok(pedido);
    }

    public async Task<ServiceResult> ObtenerHistorialCliente(int clienteId)
    {
        var pedidos = await _context.Pedidos
            .Where(p => p.ClienteId == clienteId)
            .OrderByDescending(p => p.FechaPedido)
            .Select(p => new
            {
                p.PedidoId,
                p.Estado,
                p.Total,
                p.FechaPedido,
                p.FechaEntrega,
                p.DireccionEntrega,
                NombreRestaurante = p.Restaurante.NombreRestaurante,
                Productos = p.DetallesPedido.Select(d => new
                {
                    d.Producto.Nombre,
                    d.Cantidad,
                    d.PrecioUnitario,
                    d.Subtotal
                }).ToList()
            })
            .ToListAsync();

        return ServiceResult.Ok(pedidos);
    }

    private decimal CalcularDistanciaHaversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        double dLat = (lat2 - lat1) * Math.PI / 180;
        double dLon = (lon2 - lon1) * Math.PI / 180;
        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                   Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                   Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return (decimal)(R * c);
    }
}