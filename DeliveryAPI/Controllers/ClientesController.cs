using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController : ControllerBase
{
    private readonly IClienteService _clienteService;
    private readonly IPedidoService _pedidoService;

    public ClientesController(IClienteService clienteService, IPedidoService pedidoService)
    {
        _clienteService = clienteService;
        _pedidoService = pedidoService;
    }

    [HttpGet("perfil")]
    public async Task<IActionResult> ObtenerPerfil()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var resultado = await _clienteService.ObtenerPerfil(usuarioId);
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPut("perfil")]
    public async Task<IActionResult> EditarPerfil(EditarClienteDto dto)
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var resultado = await _clienteService.EditarPerfil(usuarioId, dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("historial")]
    public async Task<IActionResult> ObtenerHistorial()
    {
        var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var resultado = await _pedidoService.ObtenerHistorialCliente(usuarioId);
        return Ok(resultado.Datos);
    }
}