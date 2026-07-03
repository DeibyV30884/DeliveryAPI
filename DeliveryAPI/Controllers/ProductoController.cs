using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _productoService;

    public ProductosController(IProductoService productoService)
    {
        _productoService = productoService;
    }

    [HttpGet("restaurante/{restauranteId}")]
    public async Task<IActionResult> ObtenerPorRestaurante(int restauranteId)
    {
        var resultado = await _productoService.ObtenerProductosPorRestaurante(restauranteId);
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("{productoId}")]
    public async Task<IActionResult> ObtenerDetalle(int productoId)
    {
        var resultado = await _productoService.ObtenerDetalleProducto(productoId);
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("buscar")]
    public async Task<IActionResult> Buscar([FromQuery] string termino)
    {
        if (string.IsNullOrWhiteSpace(termino))
            return BadRequest(new { mensaje = "Ingrese un término de búsqueda" });
        var resultado = await _productoService.BuscarProductos(termino);
        return Ok(resultado.Datos);
    }
}