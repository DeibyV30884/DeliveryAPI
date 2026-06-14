using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.DTOs;

public class RegistroClienteDto
{
    // Campos de la tabla de Usuario
    [Required(ErrorMessage = "El nombre es obligatorio")]
    public string Nombre { get; set; } = "";

    [Required(ErrorMessage = "El apellido es obligatorio")]
    public string Apellido { get; set; } = "";

    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El email no es válido")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    public string Password { get; set; } = "";

    public string? Telefono { get; set; }

    [Required(ErrorMessage = "La cédula es obligatoria")]
    public string Cedula { get; set; } = "";

    // Campos de la tabla de Cliente (opcionales al registro)
    public string? DireccionPredeterminada { get; set; }
    public decimal? LatitudPredeterminada { get; set; }
    public decimal? LongitudPredeterminada { get; set; }
}