using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PedidosController : ControllerBase
{
    private readonly IPedidoService _pedidoService;

    public PedidosController(IPedidoService pedidoService)
    {
        _pedidoService = pedidoService;
    }

    [HttpPost]
    public async Task<IActionResult> CrearPedido(CrearPedidoDto dto)
    {
        var clienteIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (clienteIdClaim == null)
            return Unauthorized();

        // Obtener el ClienteId desde el UsuarioId del token
        var usuarioId = int.Parse(clienteIdClaim);
        var resultado = await _pedidoService.CrearPedido(usuarioId, dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("{pedidoId}/seguimiento")]
    public async Task<IActionResult> ObtenerSeguimiento(int pedidoId)
    {
        var clienteIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (clienteIdClaim == null)
            return Unauthorized();

        var usuarioId = int.Parse(clienteIdClaim);
        var resultado = await _pedidoService.ObtenerSeguimientoPedido(pedidoId, usuarioId);
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("historial")]
    public async Task<IActionResult> ObtenerHistorial()
    {
        var clienteIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (clienteIdClaim == null)
            return Unauthorized();

        var usuarioId = int.Parse(clienteIdClaim);
        var resultado = await _pedidoService.ObtenerHistorialCliente(usuarioId);
        return Ok(resultado.Datos);
    }
}