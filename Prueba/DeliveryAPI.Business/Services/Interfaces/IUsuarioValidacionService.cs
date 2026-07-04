namespace DeliveryAPI.Business.Services.Interfaces;

public interface IUsuarioValidacionService
{
    Task<string?> ValidarEmailUnico(string email);
    Task<string?> ValidarEmailYCedulaUnicos(string email, string cedula);
}