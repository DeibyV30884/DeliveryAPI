using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Business.DTOs;

public class EditarRestauranteDto
{
    [Required(ErrorMessage = "El nombre del restaurante es obligatorio")]
    public string NombreRestaurante { get; set; } = "";

    public string? Telefono { get; set; }
    
    [Required(ErrorMessage = "El correo es obligatorio")]
    [EmailAddress(ErrorMessage = "El correo no es valido" )]
    public string Email { get; set; } = "";

    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$",
        ErrorMessage = "La contraseña debe tener al menos una mayuscula, una minuscula, un numero y un caracter especial (@$!%*?&)")]
    public string? Password { get; set; }

    [Required(ErrorMessage = "La dirección es obligatoria")]
    public string Direccion { get; set; } = "";

    public string? LinkGoogleMaps { get; set; }

    public string? ImagenUrl { get; set; }
    
    [Required(ErrorMessage = "Debe indicar el horario de operación")]
    [MinLength(1, ErrorMessage = "Debe indicar al menos un día")]
    public List<HorarioDiaDto> Horarios { get; set; } = new();
}