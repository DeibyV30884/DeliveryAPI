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
}
