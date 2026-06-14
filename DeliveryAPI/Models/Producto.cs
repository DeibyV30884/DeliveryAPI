using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models;

public class Producto
{
    [Key]
    public int ProductoId { get; set; }
    public int RestauranteId { get; set; }
    public string Nombre { get; set; } = "";
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public decimal? PrecioDescuento { get; set; }
    public int TiempoPreparacionMin { get; set; }
    public string? ImagenUrl { get; set; }
    public bool Activo { get; set; } = true;

    // Navegación
    public Restaurante? Restaurante { get; set; }
}