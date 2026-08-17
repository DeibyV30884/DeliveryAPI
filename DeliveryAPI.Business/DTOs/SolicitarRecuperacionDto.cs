using System.ComponentModel.DataAnnotations;
namespace DeliveryAPI.Business.DTOs;


public class SolicitarRecuperacionDto
{
    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress]
    public string Email { get; set; } = ""; 
}