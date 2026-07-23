namespace DeliveryAPI.Business.DTOs;

public class CrearRecargaSaldoDto
{
    public int ClienteId { get; set; }
    public decimal Monto { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
}