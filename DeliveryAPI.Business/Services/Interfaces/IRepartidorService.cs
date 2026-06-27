using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IRepartidorService
{
    Task<ServiceResult> RegistrarRepartidor(RegistroRepartidorDto dto);
}