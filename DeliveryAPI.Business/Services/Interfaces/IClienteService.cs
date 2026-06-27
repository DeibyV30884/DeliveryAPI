using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IClienteService
{
    Task<ServiceResult> RegistrarCliente(RegistroClienteDto dto);
}