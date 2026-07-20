using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Business.DTOs;

public class PrevisualizarPedidoDto
{
    [Required(ErrorMessage = "El restaurante es obligatorio")]
    public int RestauranteId { get; set; }

    [Required(ErrorMessage = "La latitud de entrega es obligatoria")]
    public decimal LatitudEntrega { get; set; }

    [Required(ErrorMessage = "La longitud de entrega es obligatoria")]
    public decimal LongitudEntrega { get; set; }

    [Required(ErrorMessage = "Tiene que incluir al menos un producto")]
    public List<DetallePedidoDto> Productos { get; set; } = new();
}