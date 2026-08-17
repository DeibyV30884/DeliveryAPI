using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Business.DTOs;

public class RestablecerContrasenaDto
{
    [Required]
    public string Token { get; set; } = "";

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MinLength(6, ErrorMessage = "La contraseña tiene que ser de al menos 6 caracteres")]
    public string NuevaContrasena { get; set; } = "";
}