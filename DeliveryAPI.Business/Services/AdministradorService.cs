using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class AdministradorService : IAdministradorService
{
    private readonly IAppDbContext _context;
    private readonly IUsuarioValidacionService _validacionService;

    public AdministradorService(IAppDbContext context, IUsuarioValidacionService validacionService)
    {
        _context = context;
        _validacionService = validacionService;
    }

    public async Task<ServiceResult> RegistrarAdministrador(RegistroAdministradorDto dto)
    {
        var errorComun = await _validacionService.ValidarEmailYCedulaUnicos(dto.Email, dto.Cedula);
        if (errorComun != null)
            return ServiceResult.Fallo(errorComun);

        var usuario = new Usuario
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Telefono = dto.Telefono,
            Cedula = dto.Cedula,
            Rol = "Administrador",
            Activo = true,
            FechaRegistro = DateTime.Now
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new
        {
            usuarioId = usuario.UsuarioId,
            mensaje = "Administrador registrado correctamente"
        });
    }

    public async Task<ServiceResult> ObtenerPerfil(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo && u.Rol == "Administrador");
        if (usuario == null)
            return ServiceResult.Fallo("Administrador no encontrado");

        return ServiceResult.Ok(new
        {
            usuario.Nombre,
            usuario.Apellido,
            usuario.Email,
            usuario.Telefono,
            usuario.Cedula
        });
    }

    public async Task<ServiceResult> EditarPerfil(int usuarioId, EditarAdministradorDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo && u.Rol == "Administrador");
        if (usuario == null)
            return ServiceResult.Fallo("Administrador no encontrado");

        usuario.Nombre = dto.Nombre;
        usuario.Apellido = dto.Apellido;
        usuario.Telefono = dto.Telefono;

        if (usuario.Email != dto.Email)
        {
            bool emailEnUso = await _context.Usuarios
                .AnyAsync(u => u.Email == dto.Email && u.UsuarioId != usuarioId);
            if (emailEnUso)
                return ServiceResult.Fallo("El correo electrónico ya está en uso");
            usuario.Email = dto.Email;
        }

        if (!string.IsNullOrWhiteSpace(dto.Password))
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Perfil actualizado correctamente" });
    }

    public async Task<ServiceResult> DesactivarPerfil(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo && u.Rol == "Administrador");
        if (usuario == null)
            return ServiceResult.Fallo("Administrador no encontrado");

        usuario.Activo = false;
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Perfil desactivado correctamente" });
    }
}