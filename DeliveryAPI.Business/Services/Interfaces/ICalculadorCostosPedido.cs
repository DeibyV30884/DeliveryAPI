using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Models.Entities;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface ICalculadorCostosPedido
{
    ResultadoCalculoPedido Calcular(
        Restaurante restaurante,
        List<Producto> productosValidados,
        List<DetallePedidoDto> itemsSolicitados,
        decimal latitudEntrega,
        decimal longitudEntrega);
}