using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.DTOs;

public class EditarRestauranteDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    public string Nombre { get; set; } = "";

    [Required(ErrorMessage = "El apellido es obligatorio")]
    public string Apellido { get; set; } = "";

    public string? Telefono { get; set; }

    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$",
        ErrorMessage = "La contraseña debe tener al menos una mayuscula, una minuscula, un numero y un caracter especial (@$!%*?&)")]
    public string? Password { get; set; }

    [Required(ErrorMessage = "El nombre del restaurante es obligatorio")]
    public string NombreRestaurante { get; set; } = "";

    [Required(ErrorMessage = "La dirección es obligatoria")]
    public string Direccion { get; set; } = "";

    public string? LinkGoogleMaps { get; set; }
}