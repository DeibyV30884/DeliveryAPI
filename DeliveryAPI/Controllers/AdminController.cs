using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeliveryAPI.Controllers;

[Authorize(Roles = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class AdministradorController : ControllerBase
{
    private readonly IAdministradorService _administradorService;

    public AdministradorController(IAdministradorService administradorService)
    {
        _administradorService = administradorService;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("registro")]
    public async Task<IActionResult> RegistrarAdministrador(RegistroAdministradorDto dto)
    {
        var resultado = await _administradorService.RegistrarAdministrador(dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("perfil")]
    public async Task<IActionResult> ObtenerPerfil()
    {
        var resultado = await _administradorService.ObtenerPerfil(ObtenerUsuarioId());
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
    

    [HttpPut("perfil")]
    public async Task<IActionResult> EditarPerfil(EditarAdministradorDto dto)
    {
        var resultado = await _administradorService.EditarPerfil(ObtenerUsuarioId(), dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPut("perfil/desactivar")]
    public async Task<IActionResult> DesactivarPerfil()
    {
        var resultado = await _administradorService.DesactivarPerfil(ObtenerUsuarioId());
        if (!resultado.Exito) 
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
    
    [HttpGet("usuarios")]
    public async Task<IActionResult> ObtenerUsuarios(
        [FromQuery] string? busqueda,
        [FromQuery] string? rol,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanoPagina = 10)
    {
        var resultado = await _administradorService.ObtenerUsuarios(
            busqueda,
            rol,
            pagina,
            tamanoPagina
        );

        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });

        return Ok(resultado.Datos);
    }

    [HttpGet("usuarios/resumen")]
    public async Task<IActionResult> ObtenerResumenUsuarios()
    {
        var resultado = await _administradorService.ObtenerResumenUsuarios();

        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });

        return Ok(resultado.Datos);
    }

    [HttpPut("usuarios/{usuarioId}/estado")]
    public async Task<IActionResult> CambiarEstadoUsuario(int usuarioId)
    {
        var resultado = await _administradorService.CambiarEstadoUsuario(usuarioId);

        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });

        return Ok(resultado.Datos);
    }
    
    [HttpGet("dashboard")]
    public async Task<IActionResult> ObtenerEstadisticasDashboard()
    {
        var resultado = await _administradorService.ObtenerEstadisticasDashboard();
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
}