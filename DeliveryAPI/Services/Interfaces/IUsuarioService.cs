

using DeliveryAPI.Models.DTOs;

namespace DeliveryAPI.Services.Interfaces;

public interface IUsuarioService
{
    Task<ServiceResult> Login(LoginDto dto);
}