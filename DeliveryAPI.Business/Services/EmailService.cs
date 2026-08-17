using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace DeliveryAPI.Business.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task EnviarCorreoRecuperacion(string destinatario, string nombre, string enlaceRecuperacion)
    {
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPort = int.Parse(_configuration["Email:SmtpPort"]!);
        var smtpUser = _configuration["Email:SmtpUser"];
        var smtpPassword = _configuration["Email:SmtpPassword"];
        var remitenteNombre = _configuration["Email:RemitenteNombre"] ?? "Delivery App";
        

        var mensaje = new MimeMessage();
        mensaje.From.Add(new MailboxAddress(remitenteNombre, smtpUser));
        mensaje.To.Add(new MailboxAddress(nombre, destinatario));
        mensaje.Subject = "Recuperación de contraseña";

        var builder = new BodyBuilder
        {
            HtmlBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;'>
                    <h2 style='color: #1e293b;'>Hola {nombre},</h2>
                    <p>Recibimos una solicitud para restablecer su contraseña.</p>
                    <p>Haga clic en el siguiente botón para crear una nueva contraseña. Este enlace expira en 1 hora. </p>
                    <p style='text-align:center; margin: 30px 0;'>
                        <a href='{enlaceRecuperacion}'
                           style='background-color:#84cc16; color:#1e293b; padding:12px 24px; text-decoration:none; border-radius:9999px; font-weight:bold;'>
                           Restablecer contraseña
                        </a>
                    </p>
                    <p>Si no solicitó este cambio, ignore este correo.</p>
                </div>"
        };
        mensaje.Body = builder.ToMessageBody();

        using var cliente = new SmtpClient();
        cliente.ServerCertificateValidationCallback = (s, c, h, e) => true;
        await cliente.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
        await cliente.AuthenticateAsync(smtpUser, smtpPassword);
        await cliente.SendAsync(mensaje);
        await cliente.DisconnectAsync(true);
    }
}
