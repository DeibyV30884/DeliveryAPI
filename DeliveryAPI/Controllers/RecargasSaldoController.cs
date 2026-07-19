using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RecargasSaldoController : ControllerBase
{
    private readonly IRecargaSaldoService _recargaSaldoService;

    public RecargasSaldoController(IRecargaSaldoService recargaSaldoService)
    {
        _recargaSaldoService = recargaSaldoService;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("buscar-clientes")]
    public async Task<IActionResult> BuscarClientes([FromQuery] string termino)
    {
        var resultado = await _recargaSaldoService.BuscarClientes(termino);

        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });

        return Ok(resultado.Datos);
    }

    [HttpGet("historial")]
    public async Task<IActionResult> ObtenerHistorial()
    {
        var resultado = await _recargaSaldoService.ObtenerHistorial();

        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });

        return Ok(resultado.Datos);
    }

    [HttpPost]
    public async Task<IActionResult> CrearRecarga([FromBody] CrearRecargaSaldoDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var resultado = await _recargaSaldoService.CrearRecarga(ObtenerUsuarioId(), dto);

        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });

        return Ok(resultado.Datos);
    }
}