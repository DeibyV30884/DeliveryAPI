using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeliveryAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RepartidoresController : ControllerBase
{
    private readonly IRepartidorService _repartidorService;

    public RepartidoresController(IRepartidorService repartidorService)
    {
        _repartidorService = repartidorService;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("perfil")]
    public async Task<IActionResult> ObtenerPerfil()
    {
        var resultado = await _repartidorService.ObtenerPerfil(ObtenerUsuarioId());
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPut("perfil")]
    public async Task<IActionResult> EditarPerfil(EditarRepartidorDto dto)
    {
        var resultado = await _repartidorService.EditarPerfil(ObtenerUsuarioId(), dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
    [HttpPut("disponibilidad")]
    public async Task<IActionResult> CambiarDisponibilidad([FromBody] bool disponible)
    {
        var resultado = await _repartidorService.CambiarDisponibilidad(ObtenerUsuarioId(), disponible);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPut("perfil/desactivar")]
    public async Task<IActionResult> DesactivarPerfil()
    {
        var resultado = await _repartidorService.DesactivarPerfil(ObtenerUsuarioId());
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
}