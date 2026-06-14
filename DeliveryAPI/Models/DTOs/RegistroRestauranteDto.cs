using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.DTOs;

public class RegistroRestauranteDto
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

    // Campos de la tabla de Restaurante
    [Required(ErrorMessage = "El nombre del restaurante es obligatorio")]
    public string NombreRestaurante { get; set; } = "";

    [Required(ErrorMessage = "La cédula jurídica es obligatoria")]
    public string CedulaJuridica { get; set; } = "";

    [Required(ErrorMessage = "La dirección es obligatoria")]
    public string Direccion { get; set; } = "";

    [Required(ErrorMessage = "El link de Google Maps es obligatorio")]
    public string LinkGoogleMaps { get; set; } = "";

    [Required(ErrorMessage = "Tiene que aceptar la comisión")]
    public bool AceptaComision { get; set; }
}