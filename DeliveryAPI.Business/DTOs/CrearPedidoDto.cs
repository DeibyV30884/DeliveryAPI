using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Business.DTOs;

public class CrearPedidoDto
{
    [Required(ErrorMessage = "El restaurante es obligatorio")]
    public int RestauranteId { get; set; }

    [Required(ErrorMessage = "La dirección de entrega es obligatoria")]
    public string DireccionEntrega { get; set; } = "";

    [Required(ErrorMessage = "La latitud de entrega es obligatoria")]
    public decimal LatitudEntrega { get; set; }

    [Required(ErrorMessage = "La longitud de entrega es obligatoria")]
    public decimal LongitudEntrega { get; set; }

    public string? NotaCliente { get; set; }

    [Required(ErrorMessage = "Debe incluir al menos un producto")]
    public List<DetallePedidoDto> Productos { get; set; } = new();
}

public class DetallePedidoDto
{
    [Required]
    public int ProductoId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "La cantidad mínima es 1")]
    public int Cantidad { get; set; }
}