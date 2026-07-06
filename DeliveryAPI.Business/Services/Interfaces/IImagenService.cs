using Microsoft.AspNetCore.Http;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IImagenService
{
    Task<ServiceResult> SubirImagen(IFormFile archivo);
}