using DeliveryAPI.Business.DTOs;


namespace DeliveryAPI.Business.Services.Interfaces;

public interface IClienteService
{
    Task<ServiceResult> ObtenerPerfil(int usuarioId);
    Task<ServiceResult> EditarPerfil(int usuarioId, EditarClienteDto dto);
}