using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IClienteService
{
    Task<ServiceResult> RegistrarCliente(RegistroClienteDto dto);
    Task<ServiceResult> ObtenerPerfil(int usuarioId);
    Task<ServiceResult> EditarPerfil(int usuarioId, EditarClienteDto dto);
    Task<ServiceResult> DesactivarPerfil(int usuarioId);
    Task<ServiceResult> ObtenerSaldo(int usuarioId);
}