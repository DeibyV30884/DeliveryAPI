using DeliveryAPI.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IAppDbContext _context;

    public ProductosController(IAppDbContext context)
    {
        _context = context;
    }

    [HttpGet("restaurante/{restauranteId}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerProductosPorRestaurante(int restauranteId)
    {
        var restauranteExiste = await _context.Restaurantes
            .AnyAsync(r => r.RestauranteId == restauranteId && r.Activo);

        if (!restauranteExiste)
            return NotFound(new { mensaje = "Restaurante no encontrado" });

        var productos = await _context.Productos
            .Where(p => p.RestauranteId == restauranteId && p.Activo)
            .Select(p => new
            {
                p.ProductoId,
                p.Nombre,
                p.Descripcion,
                p.Precio,
                p.PrecioDescuento,
                p.ImagenUrl,
                p.TiempoPreparacionMin
            })
            .ToListAsync();

        return Ok(productos);
    }

    [HttpGet("{productoId}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerProductoPorId(int productoId)
    {
        var producto = await _context.Productos
            .Where(p => p.ProductoId == productoId && p.Activo)
            .Select(p => new
            {
                p.ProductoId,
                p.RestauranteId,
                p.Nombre,
                p.Descripcion,
                p.Precio,
                p.PrecioDescuento,
                p.ImagenUrl,
                p.TiempoPreparacionMin
            })
            .FirstOrDefaultAsync();

        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        return Ok(producto);
    }
}