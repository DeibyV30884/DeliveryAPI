using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models;

public class Cliente
{
    [Key]
    public int ClienteId { get; set; }
    public int UsuarioId { get; set; }
    public string? DireccionPredeterminada { get; set; }
    public decimal? LatitudPredeterminada { get; set; }
    public decimal? LongitudPredeterminada { get; set; }
    public decimal Saldo { get; set; } = 0;
    public bool Activo { get; set; } = true;

    // Navegación
    public Usuario? Usuario { get; set; }
}