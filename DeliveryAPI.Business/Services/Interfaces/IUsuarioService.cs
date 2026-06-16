using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IUsuarioService
{
    Task<ServiceResult> Login(LoginDto dto);
}
