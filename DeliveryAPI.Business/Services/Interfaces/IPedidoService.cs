using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IPedidoService
{
    Task<ServiceResult> PrevisualizarPedido(int clienteId, PrevisualizarPedidoDto dto);
    Task<ServiceResult> CrearPedido(int clienteId, CrearPedidoDto dto);
    Task<ServiceResult> ObtenerSeguimientoPedido(int pedidoId, int clienteId);
    Task<ServiceResult> ObtenerHistorialCliente(int clienteId);
}