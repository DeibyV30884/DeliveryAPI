using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.Entities;

public class Pedido
{
    [Key]
    public int PedidoId { get; set; }
    public int ClienteId { get; set; }
    public int RestauranteId { get; set; }
    public int? RepartidorId { get; set; }
    public string DireccionEntrega { get; set; } = "";
    public decimal LatitudEntrega { get; set; }
    public decimal LongitudEntrega { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public string CodigoConfirmacion { get; set; } = "";
    public decimal Subtotal { get; set; }
    public decimal ComisionPlataforma { get; set; }
    public decimal CostoEnvio { get; set; }
    public decimal Total { get; set; }
    public decimal DistanciaKm { get; set; }
    public int TiempoEstimadoMin { get; set; }
    public string? NotaCliente { get; set; }
    public DateTime FechaPedido { get; set; } = DateTime.Now;
    public DateTime? FechaEntrega { get; set; }
    public DateTime? FechaInicioEnCamino { get; set; } 
    
    public DateTime? FechaInicioRegreso { get; set; }

    // Navegación
    public Cliente? Cliente { get; set; }
    public Restaurante? Restaurante { get; set; }
    public Repartidor? Repartidor { get; set; }
    public ICollection<DetallePedido> DetallesPedido { get; set; } = new List<DetallePedido>();
}