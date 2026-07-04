using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Business.DTOs;

public class EditarAdministradorDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    public string Nombre { get; set; } = "";

    [Required(ErrorMessage = "El apellido es obligatorio")]
    public string Apellido { get; set; } = "";

    public string? Telefono { get; set; }
    
    [Required(ErrorMessage = "El correo es obligatorio")]
    [EmailAddress(ErrorMessage = "El correo no es valido")]
    public string Email { get; set; } = "";
    
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$",
        ErrorMessage = "La contraseña debe tener al menos una mayuscula, una minuscula, un numero y un caracter especial (@$!%*?&)")]
    public string? Password { get; set; }
    
}