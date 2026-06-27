using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IClienteService _clienteService;
    private readonly IRestauranteService _restauranteService;
    private readonly IRepartidorService _repartidorService;

    public UsuariosController(
        IAuthService authService,
        IClienteService clienteService,
        IRestauranteService restauranteService,
        IRepartidorService repartidorService)
    {
        _authService = authService;
        _clienteService = clienteService;
        _restauranteService = restauranteService;
        _repartidorService = repartidorService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var resultado = await _authService.Login(dto);
        if (!resultado.Exito)
            return Unauthorized(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPost("registro/cliente")]
    public async Task<IActionResult> RegistrarCliente(RegistroClienteDto dto)
    {
        var resultado = await _clienteService.RegistrarCliente(dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPost("registro/restaurante")]
    public async Task<IActionResult> RegistrarRestaurante(RegistroRestauranteDto dto)
    {
        var resultado = await _restauranteService.RegistrarRestaurante(dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }

    [HttpPost("registro/repartidor")]
    public async Task<IActionResult> RegistrarRepartidor(RegistroRepartidorDto dto)
    {
        var resultado = await _repartidorService.RegistrarRepartidor(dto);
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
}