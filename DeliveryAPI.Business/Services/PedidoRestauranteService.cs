using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class PedidoRestauranteService : IPedidoRestauranteService
{
    private readonly IAppDbContext _context;

    public PedidoRestauranteService(IAppDbContext context)
    {
        _context = context;
    }

    private async Task<Restaurante?> ObtenerRestaurantePorUsuario(int usuarioId)
    {
        return await _context.Restaurantes
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
    }

    // Recien llegados: el restaurante todavía no los ha aceptado
    public async Task<ServiceResult> ObtenerPedidosPendientes(int usuarioId)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        var pedidos = await _context.Pedidos
            .Where(p => p.RestauranteId == restaurante.RestauranteId
                     && p.Estado == "Pendiente"
                     && p.RepartidorId == null)
            .OrderBy(p => p.FechaPedido)
            .Select(p => new
            {
                p.PedidoId,
                Cliente = p.Cliente!.Usuario!.Nombre + " "+ p.Cliente.Usuario.Apellido,
                Productos = p.DetallesPedido.Select(d => new { d.Producto!.Nombre, d.Cantidad }),
                p.DireccionEntrega,
                p.LatitudEntrega,
                p.LongitudEntrega,
                p.Total,
                p.TiempoEstimadoMin,
                p.FechaPedido
            })
            .ToListAsync();

        return ServiceResult.Ok(new
        {
            Restaurante = new { restaurante.Latitud, restaurante.Longitud, restaurante.NombreRestaurante },
            Pedidos = pedidos
        });
    }

    // Ya cuando aceptamos el pedido en el restaurante, esperando que se les asigne repartidor
    public async Task<ServiceResult> ObtenerPedidosAceptados(int usuarioId)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        var pedidos = await _context.Pedidos
            .Where(p => p.RestauranteId == restaurante.RestauranteId
                     && p.Estado == "Aceptado"
                     && p.RepartidorId == null)
            .OrderBy(p => p.FechaPedido)
            .Select(p => new
            {
                p.PedidoId,
                Cliente = p.Cliente!.Usuario!.Nombre + " " + p.Cliente.Usuario.Apellido,
                Productos = p.DetallesPedido.Select(d => new { d.Producto!.Nombre, d.Cantidad }),
                p.DireccionEntrega,
                p.LatitudEntrega,
                p.LongitudEntrega,
                p.Total,
                p.TiempoEstimadoMin,
                p.FechaPedido
            })
            .ToListAsync();

        return ServiceResult.Ok(new
        {
            Restaurante = new { restaurante.Latitud, restaurante.Longitud, restaurante.NombreRestaurante },
            Pedidos = pedidos
        });
    }

    // Ya tienen repartidor asignado, sin importar si ya lo aceptó o está en camino
    public async Task<ServiceResult> ObtenerPedidosActivos(int usuarioId)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        var pedidos = await _context.Pedidos
            .Where(p => p.RestauranteId == restaurante.RestauranteId && p.RepartidorId != null)
            .OrderByDescending(p => p.FechaPedido)
            .Select(p => new
            {
                p.PedidoId,
                Cliente = p.Cliente!.Usuario!.Nombre + " " + p.Cliente.Usuario.Apellido,
                Repartidor = p.Repartidor!.Usuario!.Nombre + " " + p.Repartidor.Usuario.Apellido,
                p.DireccionEntrega,
                p.LatitudEntrega,
                p.LongitudEntrega,
                p.TiempoEstimadoMin,
                // "Pendiente" en este caso significa que esta asignado, esperando que el repartidor confirme"
                EstadoVisible = p.Estado == "Pendiente" ? "Esperando repartidor" : p.Estado
            })
            .ToListAsync();

        return ServiceResult.Ok(new
        {
            Restaurante = new { restaurante.Latitud, restaurante.Longitud, restaurante.NombreRestaurante },
            Pedidos = pedidos 
        });
    }

    public async Task<ServiceResult> ObtenerRepartidoresDisponibles(int usuarioId)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        var repartidores = await _context.Repartidores
            .Where(r => r.RestauranteId == restaurante.RestauranteId && r.Disponible && r.Activo)
            .Select(r => new
            {
                r.RepartidorId,
                Nombre = r.Usuario!.Nombre + " " + r.Usuario.Apellido
            })
            .ToListAsync();

        return ServiceResult.Ok(repartidores);
    }

    public async Task<ServiceResult> AceptarPedido(int usuarioId, int pedidoId)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        var pedido = await _context.Pedidos.FirstOrDefaultAsync(p => p.PedidoId == pedidoId);
        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        if (pedido.RestauranteId != restaurante.RestauranteId)
            return ServiceResult.Fallo("No tienes permiso sobre este pedido");

        if (pedido.Estado != "Pendiente" || pedido.RepartidorId != null)
            return ServiceResult.Fallo("Este pedido ya fue procesado");

        pedido.Estado = "Aceptado";
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { pedido.PedidoId, pedido.Estado });
    }

    public async Task<ServiceResult> AsignarRepartidor(int usuarioId, int pedidoId, int repartidorId)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        var pedido = await _context.Pedidos.FirstOrDefaultAsync(p => p.PedidoId == pedidoId);
        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        if (pedido.RestauranteId != restaurante.RestauranteId)
            return ServiceResult.Fallo("No tienes permiso sobre este pedido");

        if (pedido.Estado != "Aceptado")
            return ServiceResult.Fallo("Primero debes aceptar este pedido antes de asignarle un repartidor");

        if (pedido.RepartidorId != null)
            return ServiceResult.Fallo("Este pedido ya tiene un repartidor asignado");

        var repartidor = await _context.Repartidores
            .FirstOrDefaultAsync(r => r.RepartidorId == repartidorId && r.RestauranteId == restaurante.RestauranteId);

        if (repartidor == null)
            return ServiceResult.Fallo("El repartidor no pertenece a este restaurante");

        if (!repartidor.Disponible || !repartidor.Activo)
            return ServiceResult.Fallo("El repartidor seleccionado ya no está disponible");

        pedido.RepartidorId = repartidorId;
        // Vuelve a "Pendiente" para que repartidor pueda (AceptarPedido/DevolverPedido/ObtenerPedidoAsignadoPendiente) sigue funcionando sin cambios, esperando su respuesta.
        pedido.Estado = "Pendiente";
        repartidor.Disponible = false;

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new
        {
            pedido.PedidoId,
            pedido.RepartidorId,
            pedido.Estado
        });
    }
}