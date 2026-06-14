using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.DTOs;

public class RegistroRepartidorDto
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

    // Campos de la tabla de Repartidor
    [Required(ErrorMessage = "Debe seleccionar un restaurante")]
    public int RestauranteId { get; set; }
}