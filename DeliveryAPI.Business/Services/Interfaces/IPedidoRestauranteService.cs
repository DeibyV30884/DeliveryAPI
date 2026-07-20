namespace DeliveryAPI.Business.Services.Interfaces;

public interface IPedidoRestauranteService
{
    Task<ServiceResult> ObtenerPedidosPendientes(int usuarioId);
    Task<ServiceResult> ObtenerPedidosAceptados(int usuarioId);
    Task<ServiceResult> ObtenerPedidosActivos(int usuarioId);
    Task<ServiceResult> ObtenerRepartidoresDisponibles(int usuarioId);
    Task<ServiceResult> AceptarPedido(int usuarioId, int pedidoId);
    Task<ServiceResult> AsignarRepartidor(int usuarioId, int pedidoId, int repartidorId);
}