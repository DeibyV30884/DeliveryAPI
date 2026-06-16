using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Business.DTOs;

public class EditarRepartidorDto
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

    // El repartidor puede cambiar su disponibilidad desde su perfil
    public bool Disponible { get; set; }
}