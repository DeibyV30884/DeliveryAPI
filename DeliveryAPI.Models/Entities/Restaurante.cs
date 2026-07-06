using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.Entities;

public class Restaurante
{
    [Key]
    public int RestauranteId { get; set; }
    public int UsuarioId { get; set; }
    public string NombreRestaurante { get; set; } = "";
    public string CedulaJuridica { get; set; } = "";
    public string Direccion { get; set; } = "";
    public string LinkGoogleMaps { get; set; } = "";
    public decimal Latitud { get; set; }
    public decimal Longitud { get; set; }
    public bool AceptaComision { get; set; } = false;
    public bool Activo { get; set; } = true;
    public string? ImagenUrl { get; set; }

    public Usuario? Usuario { get; set; }
    public ICollection<HorarioRestaurante>? Horarios { get; set; }
}