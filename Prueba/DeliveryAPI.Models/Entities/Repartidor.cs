using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.Entities;

public class Repartidor
{
    [Key]
    public int RepartidorId { get; set; }
    public int UsuarioId { get; set; }
    public int RestauranteId { get; set; }
    public decimal? LatitudActual { get; set; }
    public decimal? LongitudActual { get; set; }
    public bool Disponible { get; set; } = false;
    public bool Activo { get; set; } = true;

    // Navegación
    public Usuario? Usuario { get; set; }
    public Restaurante? Restaurante { get; set; }
}