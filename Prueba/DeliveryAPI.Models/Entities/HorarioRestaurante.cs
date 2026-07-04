using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.Entities;

public class HorarioRestaurante
{
    [Key]
    public int HorarioId { get; set; }
    public int RestauranteId { get; set; }
    public string Dia { get; set; } = "";
    public TimeOnly HoraApertura { get; set; }
    public TimeOnly HoraCierre { get; set; }

    // Navegación
    public Restaurante? Restaurante { get; set; }
}