using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeliveryAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantesController : ControllerBase
{
    private readonly IRestauranteService _restauranteService;

    public RestaurantesController(IRestauranteService restauranteService)
    {
        _restauranteService = restauranteService;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerRestaurantes()
    {
        var resultado = await _restauranteService.ObtenerRestaurantesActivos();
        if (!resultado.Exito)
            return BadRequest(new { mensaje = resultado.Mensaje });
        return Ok(resultado.Datos);
    }
}