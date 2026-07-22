namespace DeliveryAPI.Business.Services.Interfaces;

public interface IPedidoRepartidorService
{
    Task<ServiceResult> ObtenerPedidoAsignadoPendiente(int usuarioId);
    Task<ServiceResult> ObtenerPedidoActivo(int usuarioId);
    Task<ServiceResult> AceptarPedido(int usuarioId, int pedidoId);
    Task<ServiceResult> DevolverPedido(int usuarioId, int pedidoId);
    Task<ServiceResult> ConfirmarEntrega(int usuarioId, int pedidoId, string codigoConfirmacion);
    Task<ServiceResult> ObtenerEstadoRegreso(int usuarioId);
}