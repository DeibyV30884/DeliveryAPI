using DeliveryAPI.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;


namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IAppDbContext _context;
    private readonly IProductoService _productoService;

    public ProductosController(IAppDbContext context, IProductoService productoService)
    {
        _context = context;
        _productoService = productoService;
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
    [HttpGet("gestion/restaurante/{restauranteId}")]
    public async Task<IActionResult> ObtenerProductosGestionRestaurante(int restauranteId)
    {
        var resultado = await _productoService.ObtenerProductosGestionRestaurante(restauranteId);

        if (!resultado.Exito)
            return BadRequest(resultado);

        return Ok(resultado);
    }

    [HttpPost]
    public async Task<IActionResult> CrearProducto([FromBody] CrearProductoDto dto)
    {
        var resultado = await _productoService.CrearProducto(dto);

        if (!resultado.Exito)
            return BadRequest(resultado);

        return Ok(resultado);
    }

    [HttpPut("{productoId}")]
    public async Task<IActionResult> EditarProducto(int productoId, [FromBody] EditarProductoDto dto)
    {
        var resultado = await _productoService.EditarProducto(productoId, dto);

        if (!resultado.Exito)
            return BadRequest(resultado);

        return Ok(resultado);
    }

    [HttpDelete("{productoId}")]
    public async Task<IActionResult> EliminarProducto(int productoId)
    {
        var resultado = await _productoService.EliminarProducto(productoId);

        if (!resultado.Exito)
            return BadRequest(resultado);

        return Ok(resultado);
    }
    
}