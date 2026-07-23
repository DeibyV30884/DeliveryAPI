using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class PedidoRepartidorService : IPedidoRepartidorService
{
    private readonly IAppDbContext _context;

    public PedidoRepartidorService(IAppDbContext context)
    {
        _context = context;
    }

    private async Task<Repartidor?> ObtenerRepartidorPorUsuario(int usuarioId)
    {
        return await _context.Repartidores
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
    }

    // Arma el nombre completo del cliente revisando primero que los datos existan
    private string ObtenerNombreCliente(Pedido pedido)
    {
        if (pedido.Cliente != null && pedido.Cliente.Usuario != null)
        {
            return pedido.Cliente.Usuario.Nombre + " " + pedido.Cliente.Usuario.Apellido;
        }

        return "Cliente";
    }

    // Convierte los detalles del pedido en una lista simple de nombre + cantidad
    private List<object> ObtenerProductos(Pedido pedido)
    {
        var productos = new List<object>();

        foreach (var detalle in pedido.DetallesPedido)
        {
            if (detalle.Producto != null)
            {
                productos.Add(new { detalle.Producto.Nombre, detalle.Cantidad });
            }
        }

        return productos;
    }

    public async Task<ServiceResult> ObtenerPedidoAsignadoPendiente(int usuarioId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos
            .Include(p => p.Cliente)
            .ThenInclude(c => c.Usuario)
            .Include(p => p.DetallesPedido)
            .ThenInclude(d => d.Producto)
            .Where(p => p.RepartidorId == repartidor.RepartidorId && p.Estado == "Pendiente")
            .FirstOrDefaultAsync();

        if (pedido == null)
            return ServiceResult.Fallo("No tienes ningún pedido pendiente");

        var resultado = new
        {
            pedido.PedidoId,
            Cliente = ObtenerNombreCliente(pedido),
            pedido.DireccionEntrega,
            pedido.DistanciaKm,
            pedido.TiempoEstimadoMin,
            pedido.Total,
            Productos = ObtenerProductos(pedido)
        };

        return ServiceResult.Ok(resultado);
    }

    public async Task<ServiceResult> ObtenerPedidoActivo(int usuarioId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos
            .Include(p => p.Cliente)
            .ThenInclude(c => c.Usuario)
            .Include(p => p.DetallesPedido)
            .ThenInclude(d => d.Producto)
            .Where(p => p.RepartidorId == repartidor.RepartidorId && p.Estado == "EnCamino")
            .FirstOrDefaultAsync();

        if (pedido == null)
            return ServiceResult.Fallo("No tiene ningún pedido activo en este momento");

        var resultado = new
        {
            pedido.PedidoId,
            Cliente = ObtenerNombreCliente(pedido),
            pedido.DireccionEntrega,
            pedido.LatitudEntrega,
            pedido.LongitudEntrega,
            pedido.DistanciaKm,
            pedido.TiempoEstimadoMin,
            pedido.Total,
            Productos = ObtenerProductos(pedido)
        };

        return ServiceResult.Ok(resultado);
    }

    public async Task<ServiceResult> AceptarPedido(int usuarioId, int pedidoId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos.FirstOrDefaultAsync(p => p.PedidoId == pedidoId);
        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        if (pedido.RepartidorId != repartidor.RepartidorId)
            return ServiceResult.Fallo("Este pedido no te fue asignado a ti");

        if (pedido.Estado != "Pendiente")
            return ServiceResult.Fallo("Este pedido ya no está pendiente de respuesta");

        pedido.Estado = "EnCamino";
        pedido.FechaInicioEnCamino = DateTime.Now; // arrancamos el cronómetro de la emulación
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { pedido.PedidoId, pedido.Estado });
    }

    public async Task<ServiceResult> DevolverPedido(int usuarioId, int pedidoId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos.FirstOrDefaultAsync(p => p.PedidoId == pedidoId);
        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        if (pedido.RepartidorId != repartidor.RepartidorId)
            return ServiceResult.Fallo("Este pedido no te fue asignado a ti");

        if (pedido.Estado != "Pendiente")
            return ServiceResult.Fallo("Ya no puedes devolver este pedido, revisa su estado actual");

        pedido.RepartidorId = null;
        repartidor.Disponible = true;

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { pedido.PedidoId, pedido.Estado });
    }

    public async Task<ServiceResult> ConfirmarEntrega(int usuarioId, int pedidoId, string codigoConfirmacion)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos.FirstOrDefaultAsync(p => p.PedidoId == pedidoId);
        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        if (pedido.RepartidorId != repartidor.RepartidorId)
            return ServiceResult.Fallo("Este pedido no te fue asignado a ti");

        if (pedido.Estado != "EnCamino")
            return ServiceResult.Fallo("Este pedido no está en camino, no se puede confirmar entrega");

        if (pedido.CodigoConfirmacion != codigoConfirmacion)
            return ServiceResult.Fallo("El código de confirmación no coincide");

        pedido.Estado = "Entregado";
        pedido.FechaEntrega = DateTime.Now;
        pedido.FechaInicioRegreso = DateTime.Now;

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { pedido.PedidoId, pedido.Estado, pedido.FechaEntrega });
    }

    public async Task<ServiceResult> ObtenerEstadoRegreso(int usuarioId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos
            .Include(p => p.Restaurante)
            .Where(p => p.RepartidorId == repartidor.RepartidorId
                     && p.Estado == "Entregado"
                     && p.FechaInicioRegreso != null)
            .OrderByDescending(p => p.FechaEntrega)
            .FirstOrDefaultAsync();

        if (pedido == null || repartidor.Disponible)
            return ServiceResult.Ok(new { Regresando = false, Disponible = repartidor.Disponible });

        var minutosTranscurridos = (DateTime.Now - pedido.FechaInicioRegreso!.Value).TotalMinutes;
        var distanciaRecorridaKm = 35.0 * (minutosTranscurridos / 60.0);

        double fraccion = 0;
        if (pedido.DistanciaKm > 0)
            fraccion = (double)distanciaRecorridaKm / (double)pedido.DistanciaKm;
        if (fraccion > 1) fraccion = 1;
        if (fraccion < 0) fraccion = 0;

        // El regreso va al reves: de la entrega hacia el restaurante
        var latOrigen = (double)pedido.LatitudEntrega;
        var lngOrigen = (double)pedido.LongitudEntrega;
        var latDestino = (double)pedido.Restaurante!.Latitud;
        var lngDestino = (double)pedido.Restaurante.Longitud;

        var latActual = latOrigen + fraccion * (latDestino - latOrigen);
        var lngActual = lngOrigen + fraccion * (lngDestino - lngOrigen);

        var yaLlego = fraccion >= 1;

        if (yaLlego)
        {
            repartidor.Disponible = true;
            await _context.SaveChangesAsync();
        }

        return ServiceResult.Ok(new
        {
            Regresando = !yaLlego,
            Disponible = repartidor.Disponible,
            LatitudActual = latActual,
            LongitudActual = lngActual,
            YaLlego = yaLlego
        });
    }
}