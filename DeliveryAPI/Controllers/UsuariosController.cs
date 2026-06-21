using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var resultado = await _usuarioService.Login(dto);
        if (!resultado.Exito)
            return Unauthorized(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPost("registro/cliente")]
    public async Task<IActionResult> RegistrarCliente(RegistroClienteDto dto)
    {
        var resultado = await _usuarioService.RegistrarCliente(dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPost("registro/restaurante")]
    public async Task<IActionResult> RegistrarRestaurante(RegistroRestauranteDto dto)
    {
        var resultado = await _usuarioService.RegistrarRestaurante(dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPost("registro/repartidor")]
    public async Task<IActionResult> RegistrarRepartidor(RegistroRepartidorDto dto)
    {
        var resultado = await _usuarioService.RegistrarRepartidor(dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
    
}