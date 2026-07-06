using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class ProductoService : IProductoService
{
    private readonly IAppDbContext _context;

    public ProductoService(IAppDbContext context)
    {
        _context = context;
    }
    
    private async Task<Restaurante?> ObtenerRestaurantePorUsuario(int usuarioId)
    {
        return await _context.Restaurantes
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
    }

    public async Task<ServiceResult> ObtenerProductosPorRestaurante(int restauranteId)
    {
        var restaurante = await _context.Restaurantes
            .Where(r => r.RestauranteId == restauranteId && r.Activo)
            .Select(r => new { r.RestauranteId, r.NombreRestaurante, r.Direccion })
            .FirstOrDefaultAsync();

        if (restaurante == null)
            return ServiceResult.Fallo("Restaurante no encontrado");

        var productos = await _context.Productos
            .Where(p => p.RestauranteId == restauranteId && p.Activo)
            .OrderBy(p => p.Nombre)
            .Select(p => new
            {
                p.ProductoId,
                p.Nombre,
                p.Descripcion,
                p.Precio,
                p.PrecioDescuento,
                p.TiempoPreparacionMin,
                p.ImagenUrl,
                TieneDescuento = p.PrecioDescuento != null
            })
            .ToListAsync();

        return ServiceResult.Ok(new
        {
            restaurante.RestauranteId,
            restaurante.NombreRestaurante,
            restaurante.Direccion,
            Productos = productos
        });
    }

    public async Task<ServiceResult> ObtenerDetalleProducto(int productoId)
    {
        var producto = await _context.Productos
            .FirstOrDefaultAsync(p => p.ProductoId == productoId && p.Activo);

        if (producto == null)
            return ServiceResult.Fallo("Producto no encontrado");

        return ServiceResult.Ok(producto);
    }

    public async Task<ServiceResult> BuscarProductos(string termino)
    {
        var query = _context.Productos.Where(p => p.Activo);

        if (!string.IsNullOrWhiteSpace(termino))
        {
            query = query.Where(p => p.Nombre.Contains(termino));
        }

        var productos = await query
            .OrderBy(p => p.Nombre)
            .ToListAsync();

        return ServiceResult.Ok(productos);
    }

    public async Task<ServiceResult> ObtenerProductosGestionRestaurante(int usuarioId)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        var productos = await _context.Productos
            .Where(p => p.RestauranteId == restaurante.RestauranteId)
            .OrderByDescending(p => p.Activo)
            .ThenBy(p => p.Nombre)
            .ToListAsync();

        return ServiceResult.Ok(productos);
    }

    public async Task<ServiceResult> CrearProducto(int usuarioId, CrearProductoDto dto)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        if (dto.PrecioDescuento.HasValue && dto.PrecioDescuento >= dto.Precio)
            return ServiceResult.Fallo("El precio con descuento debe ser menor al precio normal");

        var producto = new Producto
        {
            RestauranteId = restaurante.RestauranteId,
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Precio = dto.Precio,
            PrecioDescuento = dto.PrecioDescuento,
            TiempoPreparacionMin = dto.TiempoPreparacionMin,
            ImagenUrl = dto.ImagenUrl,
            Activo = dto.Activo,
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(producto);
    }

    public async Task<ServiceResult> EditarProducto(int usuarioId, int productoId, EditarProductoDto dto)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        var producto = await _context.Productos
            .FirstOrDefaultAsync(p => p.ProductoId == productoId);

        if (producto == null)
            return ServiceResult.Fallo("Producto no encontrado");

        if (producto.RestauranteId != restaurante.RestauranteId)
            return ServiceResult.Fallo("No tienes permiso para editar este producto");

        if (dto.PrecioDescuento.HasValue && dto.PrecioDescuento >= dto.Precio)
            return ServiceResult.Fallo("El precio con descuento debe ser menor al precio normal");

        producto.Nombre = dto.Nombre;
        producto.Descripcion = dto.Descripcion;
        producto.Precio = dto.Precio;
        producto.PrecioDescuento = dto.PrecioDescuento;
        producto.TiempoPreparacionMin = dto.TiempoPreparacionMin;
        producto.ImagenUrl = dto.ImagenUrl;
        producto.Activo = dto.Activo;

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(producto);
    }

    public async Task<ServiceResult> EliminarProducto(int usuarioId, int productoId)
    {
        var restaurante = await ObtenerRestaurantePorUsuario(usuarioId);
        if (restaurante == null)
            return ServiceResult.Fallo("No se encontró un restaurante asociado a este usuario");

        var producto = await _context.Productos
            .FirstOrDefaultAsync(p => p.ProductoId == productoId);

        if (producto == null)
            return ServiceResult.Fallo("Producto no encontrado");

        if (producto.RestauranteId != restaurante.RestauranteId)
            return ServiceResult.Fallo("No tienes permiso para eliminar este producto");
        
        producto.Activo = false;
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(producto);
    }
}