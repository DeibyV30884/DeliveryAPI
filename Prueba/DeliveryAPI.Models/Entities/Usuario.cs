using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.Entities;

public class Usuario
{
    [Key]
    public int UsuarioId { get; set; }
    public string Nombre { get; set; } = "";
    public string? Apellido { get; set; } // tiene que ser nulleable porque restaurante no tiene apellido
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string? Telefono { get; set; }
    public string? Cedula { get; set; }  // tiene que ser nulleable porque restaurante no tiene cedula
    public string Rol { get; set; } = "";
    public bool Activo { get; set; } = true;
    public DateTime FechaRegistro { get; set; } = DateTime.Now;
}
