using DeliveryAPI.Models.Entities;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface ITokenService
{
    string GenerarToken(Usuario usuario);
}