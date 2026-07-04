using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class ClienteService : IClienteService
{
    private readonly IAppDbContext _context;

    public ClienteService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult> ObtenerPerfil(int usuarioId)
    {
        var perfil = await _context.Clientes
            .Where(c => c.UsuarioId == usuarioId && c.Activo)
            .Select(c => new
            {
                c.ClienteId,
                c.Usuario.Nombre,
                c.Usuario.Apellido,
                c.Usuario.Email,
                c.Usuario.Telefono,
                c.Usuario.Cedula,
                c.DireccionPredeterminada,
                c.LatitudPredeterminada,
                c.LongitudPredeterminada,
                c.Saldo
            })
            .FirstOrDefaultAsync();

        if (perfil == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        return ServiceResult.Ok(perfil);
    }

    public async Task<ServiceResult> EditarPerfil(int usuarioId, EditarClienteDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);

        if (usuario == null)
            return ServiceResult.Fallo("Usuario no encontrado");

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId && c.Activo);

        if (cliente == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        // Actualizar datos del usuario
        usuario.Nombre = dto.Nombre;
        usuario.Apellido = dto.Apellido;
        usuario.Telefono = dto.Telefono;

        // Cambiar contraseña solo si viene
        if (!string.IsNullOrWhiteSpace(dto.Password))
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        // Actualizar dirección del cliente
        cliente.DireccionPredeterminada = dto.DireccionPredeterminada;
        cliente.LatitudPredeterminada = dto.LatitudPredeterminada;
        cliente.LongitudPredeterminada = dto.LongitudPredeterminada;

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Perfil actualizado correctamente" });
    }
}