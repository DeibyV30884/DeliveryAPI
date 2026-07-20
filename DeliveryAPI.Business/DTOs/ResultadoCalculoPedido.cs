using DeliveryAPI.Models.Entities;

namespace DeliveryAPI.Business.DTOs;

public class ResultadoCalculoPedido
{
    public List<DetallePedido> Detalles { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal ComisionPlataforma { get; set; }
    public decimal CostoEnvio { get; set; }
    public decimal Total { get; set; }
    public decimal DistanciaKm { get; set; }
    public int TiempoEstimadoMin { get; set; }
}