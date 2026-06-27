using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IRestauranteService
{
    Task<ServiceResult> RegistrarRestaurante(RegistroRestauranteDto dto);
}