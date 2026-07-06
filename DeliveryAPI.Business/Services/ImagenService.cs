using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace DeliveryAPI.Business.Services;

public class ImagenService : IImagenService
{
    private readonly Cloudinary _cloudinary;
    private static readonly string[] ExtensionesPermitidas = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long TamanoMaximoBytes = 5 * 1024 * 1024;  // 5MB

    public ImagenService(Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
    }

    public async Task<ServiceResult> SubirImagen(IFormFile archivo)
    {
        if (archivo == null || archivo.Length == 0)
            return ServiceResult.Fallo("No se envió ningún archivo");

        if (archivo.Length > TamanoMaximoBytes)
            return ServiceResult.Fallo("La imagen no puede superar 5MB");

        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        if (!ExtensionesPermitidas.Contains(extension))
            return ServiceResult.Fallo("Formato no permitido. Usa JPG, PNG o WEBP");

        await using var stream = archivo.OpenReadStream();

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(archivo.FileName, stream),
            Folder = "productos",
            Transformation = new Transformation().Width(800).Height(800).Crop("limit")
        };

        var resultado = await _cloudinary.UploadAsync(uploadParams);

        if (resultado.Error != null)
            return ServiceResult.Fallo($"Error al subir imagen: {resultado.Error.Message}");

        return ServiceResult.Ok(new { url = resultado.SecureUrl.ToString() });
    }
}