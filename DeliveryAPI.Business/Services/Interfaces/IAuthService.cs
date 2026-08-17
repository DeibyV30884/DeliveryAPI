using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IAuthService
{
    Task<ServiceResult> Login(LoginDto dto);
    Task<ServiceResult> SolicitarRecuperacion(SolicitarRecuperacionDto dto);
    Task<ServiceResult> RestablecerContrasena(RestablecerContrasenaDto dto);
}