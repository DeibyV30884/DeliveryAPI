using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RestauranteController : ControllerBase
{
    private readonly IRestauranteService _restauranteService;
    private readonly IGoogleMapsService _googleMapsService;

    public RestauranteController(IRestauranteService restauranteService, IGoogleMapsService googleMapsService)
    {
        _restauranteService = restauranteService;
        _googleMapsService = googleMapsService;
    }
    
    [HttpGet]
    public async Task<IActionResult> ObtenerRestaurantes()
    {
        var resultado = await _restauranteService.ObtenerRestaurantesActivos();
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("perfil")]
    public async Task<IActionResult> ObtenerPerfil()
    {
        var resultado = await _restauranteService.ObtenerPerfil(ObtenerUsuarioId());
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    
    [HttpPut("perfil")]
    public async Task<IActionResult> EditarPerfil(EditarRestauranteDto dto)
    {
        var resultado = await _restauranteService.EditarPerfil(ObtenerUsuarioId(), dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPut("perfil/desactivar")]
    public async Task<IActionResult> DesactivarPerfil()
    {
        var resultado = await _restauranteService.DesactivarPerfil(ObtenerUsuarioId());
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPost("extraer-coordenadas")]
    public IActionResult ExtraerCoordenadas([FromBody] string link)
    {
        if (string.IsNullOrWhiteSpace(link))
            return BadRequest(new { mensaje = "El link está vacío" });

        var coordenadas = _googleMapsService.ExtraerCoordenadasDeLink(link);
        if (coordenadas == null)
            return BadRequest(new { mensaje = "No se pudieron extraer coordenadas del link" });
        return Ok(new { lat = coordenadas.Value.lat, lng = coordenadas.Value.lng });
    }
}