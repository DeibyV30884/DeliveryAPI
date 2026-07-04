using System.ComponentModel.DataAnnotations;

namespace DeliveryAPI.Models.Entities;

public class DetallePedido
{
    [Key]
    public int DetalleId { get; set; }
    public int PedidoId { get; set; }
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }

    // Navegación
    public Pedido? Pedido { get; set; }
    public Producto? Producto { get; set; }
}