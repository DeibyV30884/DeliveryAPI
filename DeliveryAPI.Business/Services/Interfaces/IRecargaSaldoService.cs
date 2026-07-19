using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IRecargaSaldoService
{
    Task<ServiceResult> BuscarClientes(string termino);
    Task<ServiceResult> ObtenerHistorial();
    Task<ServiceResult> CrearRecarga(int adminUsuarioId, CrearRecargaSaldoDto dto);
}