using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IUsuarioService
{
    Task<ServiceResult> Login(LoginDto dto);
    Task<ServiceResult> RegistrarCliente(RegistroClienteDto dto);
    Task<ServiceResult> RegistrarRestaurante(RegistroRestauranteDto dto);
    Task<ServiceResult> RegistrarRepartidor(RegistroRepartidorDto dto);
}
