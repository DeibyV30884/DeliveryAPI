using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Business.DTOs;

public class RegistroRestauranteDto
{
    public string? Telefono { get; set; }

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

    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El email no es válido")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    public string Password { get; set; } = "";

    [Required(ErrorMessage = "Debe indicar el horario de operación")]
    [MinLength(1, ErrorMessage = "Debe indicar al menos un día")]
    public List<HorarioDiaDto> Horarios { get; set; } = new();
}