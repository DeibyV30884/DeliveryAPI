namespace DeliveryAPI.Business.Services.Interfaces;

public interface IEmailService
{
    Task EnviarCorreoRecuperacion(string destinatario, string nombre, string enlaceRecuperacion);
}