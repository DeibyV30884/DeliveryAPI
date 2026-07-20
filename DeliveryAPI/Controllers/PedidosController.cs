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
    private readonly IPedidoRestauranteService _pedidoRestauranteService;
    private readonly IPedidoRepartidorService _pedidoRepartidorService;

    public PedidosController(
        IPedidoService pedidoService,
        IPedidoRestauranteService pedidoRestauranteService,
        IPedidoRepartidorService pedidoRepartidorService)
    {
        _pedidoService = pedidoService;
        _pedidoRestauranteService = pedidoRestauranteService;
        _pedidoRepartidorService = pedidoRepartidorService;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Cliente

    [HttpPost("preview")]
    public async Task<IActionResult> Previsualizar(PrevisualizarPedidoDto dto)
    {
        var resultado = await _pedidoService.PrevisualizarPedido(ObtenerUsuarioId(), dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPost]
    public async Task<IActionResult> CrearPedido(CrearPedidoDto dto)
    {
        var resultado = await _pedidoService.CrearPedido(ObtenerUsuarioId(), dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("{pedidoId}/seguimiento")]
    public async Task<IActionResult> ObtenerSeguimiento(int pedidoId)
    {
        var resultado = await _pedidoService.ObtenerSeguimientoPedido(pedidoId, ObtenerUsuarioId());
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpGet("historial")]
    public async Task<IActionResult> ObtenerHistorial()
    {
        var resultado = await _pedidoService.ObtenerHistorialCliente(ObtenerUsuarioId());
        return Ok(resultado.Datos);
    }

    // Restaurante

    [Authorize(Roles = "Restaurante")]
    [HttpGet("restaurante/pendientes")]
    public async Task<IActionResult> ObtenerPedidosPendientes()
    {
        var resultado = await _pedidoRestauranteService.ObtenerPedidosPendientes(ObtenerUsuarioId());
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Restaurante")]
    [HttpGet("restaurante/activos")]
    public async Task<IActionResult> ObtenerPedidosActivos()
    {
        var resultado = await _pedidoRestauranteService.ObtenerPedidosActivos(ObtenerUsuarioId());
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Restaurante")]
    [HttpGet("restaurante/repartidores-disponibles")]
    public async Task<IActionResult> ObtenerRepartidoresDisponibles()
    {
        var resultado = await _pedidoRestauranteService.ObtenerRepartidoresDisponibles(ObtenerUsuarioId());
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Restaurante")]
    [HttpPost("restaurante/{pedidoId}/asignar/{repartidorId}")]
    public async Task<IActionResult> AsignarRepartidor(int pedidoId, int repartidorId)
    {
        var resultado = await _pedidoRestauranteService.AsignarRepartidor(ObtenerUsuarioId(), pedidoId, repartidorId);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    // Repartidor

    [Authorize(Roles = "Repartidor")]
    [HttpGet("repartidor/asignado-pendiente")]
    public async Task<IActionResult> ObtenerAsignadoPendiente()
    {
        var resultado = await _pedidoRepartidorService.ObtenerPedidoAsignadoPendiente(ObtenerUsuarioId());
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Repartidor")]
    [HttpGet("repartidor/activo")]
    public async Task<IActionResult> ObtenerPedidoActivo()
    {
        var resultado = await _pedidoRepartidorService.ObtenerPedidoActivo(ObtenerUsuarioId());
        if (!resultado.Exito)
            return NotFound(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Repartidor")]
    [HttpPost("repartidor/{pedidoId}/aceptar")]
    public async Task<IActionResult> AceptarPedido(int pedidoId)
    {
        var resultado = await _pedidoRepartidorService.AceptarPedido(ObtenerUsuarioId(), pedidoId);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Repartidor")]
    [HttpPost("repartidor/{pedidoId}/devolver")]
    public async Task<IActionResult> DevolverPedido(int pedidoId)
    {
        var resultado = await _pedidoRepartidorService.DevolverPedido(ObtenerUsuarioId(), pedidoId);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Repartidor")]
    [HttpPost("repartidor/{pedidoId}/confirmar-entrega")]
    public async Task<IActionResult> ConfirmarEntrega(int pedidoId, [FromBody] string codigoConfirmacion)
    {
        var resultado = await _pedidoRepartidorService.ConfirmarEntrega(ObtenerUsuarioId(), pedidoId, codigoConfirmacion);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
    
    [Authorize(Roles = "Restaurante")]
    [HttpGet("restaurante/aceptados")]
    public async Task<IActionResult> ObtenerPedidosAceptados()
    {
        var resultado = await _pedidoRestauranteService.ObtenerPedidosAceptados(ObtenerUsuarioId());
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [Authorize(Roles = "Restaurante")]
    [HttpPost("restaurante/{pedidoId}/aceptar")]
    public async Task<IActionResult> AceptarPedidoRestaurante(int pedidoId)
    {
        var resultado = await _pedidoRestauranteService.AceptarPedido(ObtenerUsuarioId(), pedidoId);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
    
    [Authorize(Roles = "Repartidor")]
    [HttpGet("repartidor/estado-regreso")]
    public async Task<IActionResult> ObtenerEstadoRegreso()
    {
        var resultado = await _pedidoRepartidorService.ObtenerEstadoRegreso(ObtenerUsuarioId());
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
}