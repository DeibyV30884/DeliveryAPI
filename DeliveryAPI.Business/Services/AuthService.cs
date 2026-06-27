using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class AuthService : IAuthService
{
    private readonly IAppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthService(IAppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
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
}