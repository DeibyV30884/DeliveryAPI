using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models;

public class Notificacion
{
    [Key]
    public int NotificacionId { get; set; }
    public int UsuarioId { get; set; }
    public string Mensaje { get; set; } = "";
    public bool Leida { get; set; } = false;
    public DateTime Fecha { get; set; } = DateTime.Now;

    // Navegación
    public Usuario? Usuario { get; set; }
}