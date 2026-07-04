using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.Entities;

public class RecargaSaldo
{
    [Key]
    public int RecargaId { get; set; }
    public int ClienteId { get; set; }
    public int AdminId { get; set; }
    public decimal Monto { get; set; }
    public string Nota { get; set; } = "";
    public DateTime Fecha { get; set; } = DateTime.Now;

    // Navegación
    public Cliente? Cliente { get; set; }
    public Usuario? Admin { get; set; }
}