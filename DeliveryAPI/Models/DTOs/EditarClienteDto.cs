using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.DTOs;

public class EditarClienteDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    public string Nombre { get; set; } = "";

    
    [Required(ErrorMessage = "El apellido es obligatorio")]
    public string Apellido { get; set; } = "";

    public string? Telefono { get; set; }

    // Si viene null o vacio no se cambia la contraseña
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$",
        ErrorMessage = "La contraseña tiene que tener al menos una mayuscula, una minuscula, un número y un caracter especial (@$!%*?&)" )]
    public string? Password { get; set; }

    public string? DireccionPredeterminada {get; set; }
    public decimal? LatitudPredeterminada { get; set; }
    public decimal? LongitudPredeterminada { get; set; }
    
}