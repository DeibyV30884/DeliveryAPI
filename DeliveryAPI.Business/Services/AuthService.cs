using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DeliveryAPI.Business.Services;

public class AuthService : IAuthService
{
    private readonly IAppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthService(
        IAppDbContext context,
        ITokenService tokenService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<ServiceResult> Login(LoginDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Activo);

        if (usuario == null)
            return ServiceResult.Fallo("Credenciales incorrectas");

        bool passwordCorrecta = BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash);
        if (!passwordCorrecta)
            return ServiceResult.Fallo("Credenciales incorrectas");

        var token = _tokenService.GenerarToken(usuario);
        return ServiceResult.Ok(new
        {
            token,
            usuarioId = usuario.UsuarioId,
            nombre = usuario.Nombre,
            rol = usuario.Rol
        });
    }

    public async Task<ServiceResult> SolicitarRecuperacion(SolicitarRecuperacionDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Activo);
        
        if (usuario == null)
            return ServiceResult.Ok(new { mensaje = "Si el correo existe, se ha enviado un enlace de recuperación" });

        usuario.TokenRecuperacion = Guid.NewGuid().ToString("N");
        usuario.TokenRecuperacionExpira = DateTime.UtcNow.AddHours(1);
        await _context.SaveChangesAsync();

        var urlFrontend = _configuration["Email:UrlFrontend"];
        var enlace = $"{urlFrontend}/restablecer-contrasena?token={usuario.TokenRecuperacion}";

        await _emailService.EnviarCorreoRecuperacion(usuario.Email, usuario.Nombre, enlace);

        return ServiceResult.Ok(new { mensaje = "Si el correo existe, se ha enviado un enlace de recuperación" });
    }

    public async Task<ServiceResult> RestablecerContrasena(RestablecerContrasenaDto dto)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u =>
            u.TokenRecuperacion == dto.Token &&
            u.TokenRecuperacionExpira != null &&
            u.TokenRecuperacionExpira > DateTime.UtcNow);

        if (usuario == null)
            return ServiceResult.Fallo("El enlace no es válido o ha expirado");

        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaContrasena);
        usuario.TokenRecuperacion = null;
        usuario.TokenRecuperacionExpira = null;
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Contraseña actualizada" });
    }
}