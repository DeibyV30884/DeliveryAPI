using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Business.DTOs;

public class HorarioDiaDto
{
    [Required(ErrorMessage = "El día es obligatorio")]
    public string Dia { get; set; } = ""; // Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo

    public bool Abierto { get; set; }

    public TimeOnly? HoraApertura { get; set; }
    public TimeOnly? HoraCierre { get; set; }
}
