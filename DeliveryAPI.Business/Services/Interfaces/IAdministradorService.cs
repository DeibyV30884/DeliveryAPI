using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IAdministradorService
{
    Task<ServiceResult> RegistrarAdministrador(RegistroAdministradorDto dto);
    Task<ServiceResult> ObtenerPerfil(int usuarioId);
    Task<ServiceResult> EditarPerfil(int usuarioId, EditarAdministradorDto dto);
    Task<ServiceResult> DesactivarPerfil(int usuarioId);
}