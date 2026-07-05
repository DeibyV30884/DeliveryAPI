using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Business.DTOs;

public class CrearProductoDto
{
    [Required, StringLength(150, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(500)]
    public string Descripcion { get; set; } = string.Empty;

    [Range(0.01, 1_000_000)]
    public decimal Precio { get; set; }

    [Range(0.01, 1_000_000)]
    public decimal? PrecioDescuento { get; set; }

    [Range(0, 300)]
    public int TiempoPreparacionMin { get; set; }

    [Url]
    public string? ImagenUrl { get; set; }

    public bool Activo { get; set; } = true;
}