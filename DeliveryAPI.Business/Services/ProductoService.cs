using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Models.Entities;


namespace DeliveryAPI.Business.Services;

public class ProductoService : IProductoService
{
    private readonly IAppDbContext _context;

    public ProductoService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult> ObtenerProductosPorRestaurante(int restauranteId)
    {
        var restaurante = await _context.Restaurantes
            .Where(r => r.RestauranteId == restauranteId && r.Activo)
            .FirstOrDefaultAsync();

        if (restaurante == null)
            return ServiceResult.Fallo("Restaurante no encontrado o inactivo");

        var productos = await _context.Productos
            .Where(p => p.RestauranteId == restauranteId && p.Activo)
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
            productos
        });
    }

    public async Task<ServiceResult> ObtenerDetalleProducto(int productoId)
    {
        var producto = await _context.Productos
            .Where(p => p.ProductoId == productoId && p.Activo)
            .Select(p => new
            {
                p.ProductoId,
                p.Nombre,
                p.Descripcion,
                p.Precio,
                p.PrecioDescuento,
                p.TiempoPreparacionMin,
                p.ImagenUrl,
                TieneDescuento = p.PrecioDescuento != null,
                Restaurante = new
                {
                    p.Restaurante.RestauranteId,
                    p.Restaurante.NombreRestaurante
                }
            })
            .FirstOrDefaultAsync();

        if (producto == null)
            return ServiceResult.Fallo("Producto no encontrado");

        return ServiceResult.Ok(producto);
    }

    public async Task<ServiceResult> BuscarProductos(string termino)
    {
        var productos = await _context.Productos
            .Where(p => p.Activo && p.Nombre.Contains(termino))
            .Select(p => new
            {
                p.ProductoId,
                p.Nombre,
                p.Precio,
                p.PrecioDescuento,
                p.ImagenUrl,
                p.Restaurante.RestauranteId,
                NombreRestaurante = p.Restaurante.NombreRestaurante,
                TieneDescuento = p.PrecioDescuento != null
            })
            .ToListAsync();

        return ServiceResult.Ok(productos);
    }
    public async Task<ServiceResult> ObtenerProductosGestionRestaurante(int restauranteId)
    {
        var productos = await _context.Productos
            .Where(p => p.RestauranteId == restauranteId)
            .Select(p => new
            {
                p.ProductoId,
                p.RestauranteId,
                p.Nombre,
                p.Descripcion,
                p.Precio,
                p.PrecioDescuento,
                p.TiempoPreparacionMin,
                p.ImagenUrl,
                p.Activo,
                TieneDescuento = p.PrecioDescuento != null
            })
            .ToListAsync();

        return ServiceResult.Ok(productos);
    }
    public async Task<ServiceResult> CrearProducto(CrearProductoDto dto)
    {
        var restauranteExiste = await _context.Restaurantes
            .AnyAsync(r => r.RestauranteId == dto.RestauranteId && r.Activo);

        if (!restauranteExiste)
            return ServiceResult.Fallo("Restaurante no encontrado o inactivo");

        var producto = new Producto
        {
            RestauranteId = dto.RestauranteId,
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Precio = dto.Precio,
            PrecioDescuento = dto.PrecioDescuento,
            TiempoPreparacionMin = dto.TiempoPreparacionMin,
            ImagenUrl = dto.ImagenUrl,
            Activo = dto.Activo
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(producto);
    }
    public async Task<ServiceResult> EditarProducto(int productoId, EditarProductoDto dto)
    {
        var producto = await _context.Productos
            .FirstOrDefaultAsync(p => p.ProductoId == productoId);

        if (producto == null)
            return ServiceResult.Fallo("Producto no encontrado");

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
    
    public async Task<ServiceResult> EliminarProducto(int productoId)
    {
        var producto = await _context.Productos
            .FirstOrDefaultAsync(p => p.ProductoId == productoId);

        if (producto == null)
            return ServiceResult.Fallo("Producto no encontrado");

        producto.Activo = false;

        await _context.SaveChangesAsync();

        return ServiceResult.Ok("Producto desactivado correctamente");
    }
    
}