using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeliveryAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly IClienteService _clienteService;
    private readonly IGoogleMapsService _googleMapsService;


    public ClientesController(IClienteService clienteService, IGoogleMapsService googleMapsService)
    {
        _clienteService = clienteService;
        _googleMapsService = googleMapsService;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("perfil")]
    public async Task<IActionResult> ObtenerPerfil()
    {
        var resultado = await _clienteService.ObtenerPerfil(ObtenerUsuarioId());
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPut("perfil")]
    public async Task<IActionResult> EditarPerfil(EditarClienteDto dto)
    {
        var resultado = await _clienteService.EditarPerfil(ObtenerUsuarioId(), dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
    [HttpPut("perfil/desactivar")]
    public async Task<IActionResult> DesactivarPerfil()
    {
        var resultado = await _clienteService.DesactivarPerfil(ObtenerUsuarioId());
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
    
    [HttpGet("saldo")]
    public async Task<IActionResult> ObtenerSaldo()
    {
        var resultado = await _clienteService.ObtenerSaldo(ObtenerUsuarioId());
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
    
    [HttpPost("extraer-coordenadas")]
    public IActionResult ExtraerCoordenadas([FromBody] string link)
    {
        Console.WriteLine($"Link recibido: {link}");
        if (string.IsNullOrWhiteSpace(link))
            return BadRequest(new { mensaje = "El link está vacío" });
    
        var coordenadas = _googleMapsService.ExtraerCoordenadasDeLink(link);
        if (coordenadas == null)
            return BadRequest(new { mensaje = "No se pudieron extraer coordenadas del link" });
        return Ok(new { lat = coordenadas.Value.lat, lng = coordenadas.Value.lng });
    }
}