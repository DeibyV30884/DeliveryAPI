using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _productoService;
    private readonly IImagenService _imagenService;

    public ProductosController(IProductoService productoService, IImagenService imagenService)
    {
        _productoService = productoService;
        _imagenService = imagenService;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("restaurante/{restauranteId}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerProductosPorRestaurante(int restauranteId)
    {
        var resultado = await _productoService.ObtenerProductosPorRestaurante(restauranteId);
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("{productoId}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerProductoPorId(int productoId)
    {
        var resultado = await _productoService.ObtenerDetalleProducto(productoId);
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("buscar")]
    [AllowAnonymous]
    public async Task<IActionResult> BuscarProductos([FromQuery] string termino)
    {
        var resultado = await _productoService.BuscarProductos(termino);
        return Ok(resultado.Datos);
    }
    
    [Authorize(Roles = "Restaurante")]
    [HttpGet("gestion")]
    public async Task<IActionResult> ObtenerProductosGestionRestaurante()
    {
        var resultado = await _productoService.ObtenerProductosGestionRestaurante(ObtenerUsuarioId());
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Restaurante")]
    [HttpPost]
    public async Task<IActionResult> CrearProducto([FromBody] CrearProductoDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var resultado = await _productoService.CrearProducto(ObtenerUsuarioId(), dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Restaurante")]
    [HttpPut("{productoId}")]
    public async Task<IActionResult> EditarProducto(int productoId, [FromBody] EditarProductoDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var resultado = await _productoService.EditarProducto(ObtenerUsuarioId(), productoId, dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Restaurante")]
    [HttpDelete("{productoId}")]
    public async Task<IActionResult> EliminarProducto(int productoId)
    {
        var resultado = await _productoService.EliminarProducto(ObtenerUsuarioId(), productoId);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Restaurante")]
    [HttpPost("imagenes")]
    public async Task<IActionResult> SubirImagenProducto(IFormFile archivo)
    {
        var resultado = await _imagenService.SubirImagen(archivo);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
}