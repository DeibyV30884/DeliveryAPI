using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IRepartidorService
{
    Task<ServiceResult> RegistrarRepartidor(RegistroRepartidorDto dto);
    Task<ServiceResult> ObtenerPerfil(int usuarioId);
    Task<ServiceResult> EditarPerfil(int usuarioId, EditarRepartidorDto dto);
    Task<ServiceResult> CambiarDisponibilidad(int usuarioId, bool disponible);
    Task<ServiceResult> DesactivarPerfil(int usuarioId);
    Task<ServiceResult> ObtenerHistorialYEstadisticas(int usuarioId, string? estado, DateTime? fecha);
}