using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.Entities;

public class Usuario
{
    [Key]
    public int UsuarioId { get; set; }
    public string Nombre { get; set; } = "";
    public string Apellido { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string? Telefono { get; set; }
    public string Cedula { get; set; } = "";
    public string Rol { get; set; } = "";
    public bool Activo { get; set; } = true;
    public DateTime FechaRegistro { get; set; } = DateTime.Now;
}
