namespace DeliveryAPI.Business.DTOs;

public class CrearProductoDto
{
    public int RestauranteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public decimal? PrecioDescuento { get; set; }
    public int TiempoPreparacionMin { get; set; }
    public string? ImagenUrl { get; set; }
    public bool Activo { get; set; } = true;
}