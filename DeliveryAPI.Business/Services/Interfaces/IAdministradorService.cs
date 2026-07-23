using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IAdministradorService
{
    Task<ServiceResult> RegistrarAdministrador(RegistroAdministradorDto dto);
    Task<ServiceResult> ObtenerPerfil(int usuarioId);
    Task<ServiceResult> EditarPerfil(int usuarioId, EditarAdministradorDto dto);
    Task<ServiceResult> DesactivarPerfil(int usuarioId);

    Task<ServiceResult> ObtenerUsuarios(
        string? busqueda,
        string? rol,
        int pagina,
        int tamanoPagina
    );

    Task<ServiceResult> ObtenerResumenUsuarios();

    Task<ServiceResult> CambiarEstadoUsuario(int usuarioId);

    // periodo puede ser: hoy, semana, mes, anio
    Task<ServiceResult> ObtenerEstadisticasDashboard(string? periodo);
}