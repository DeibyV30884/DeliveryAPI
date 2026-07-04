using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IRestauranteService
{
    Task<ServiceResult> RegistrarRestaurante(RegistroRestauranteDto dto);
    Task<ServiceResult> ObtenerRestaurantesActivos();
    Task<ServiceResult> ObtenerPerfil(int usuarioId);
    Task<ServiceResult> EditarPerfil(int usuarioId, EditarRestauranteDto dto);
    Task<ServiceResult> DesactivarPerfil(int usuarioId);
}