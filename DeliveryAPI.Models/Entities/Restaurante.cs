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
    public decimal Latitud { get; set; }
    public decimal Longitud { get; set; }
    public TimeOnly HorarioApertura { get; set; }
    public TimeOnly HorarioCierre { get; set; }
    public bool AceptaComision { get; set; } = false;
    public bool Activo { get; set; } = true;
    public Usuario? Usuario { get; set; }
}
