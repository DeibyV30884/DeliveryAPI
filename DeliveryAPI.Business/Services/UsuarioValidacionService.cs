using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class UsuarioValidacionService : IUsuarioValidacionService
{
    private readonly IAppDbContext _context;

    public UsuarioValidacionService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<string?> ValidarEmailUnico(string email)
    {
        bool emailExiste = await _context.Usuarios.AnyAsync(u => u.Email == email);
        return emailExiste ? "El correo electrónico ya está registrado" : null;
    }

    public async Task<string?> ValidarEmailYCedulaUnicos(string email, string cedula)
    {
        var errorEmail = await ValidarEmailUnico(email);
        if (errorEmail != null)
            return errorEmail;

        bool cedulaExiste = await _context.Usuarios.AnyAsync(u => u.Cedula == cedula);
        if (cedulaExiste)
            return "La cédula ya está registrada";

        return null;
    }
}