using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Models;

[Index("Email", IsUnique = true)]
[Index("Cedula", IsUnique = true)]
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