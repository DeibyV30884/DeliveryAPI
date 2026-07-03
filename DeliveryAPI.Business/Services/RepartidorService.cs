using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class RepartidorService : IRepartidorService
{
    private readonly IAppDbContext _context;
    private readonly IUsuarioValidacionService _validacionService;

    public RepartidorService(IAppDbContext context, IUsuarioValidacionService validacionService)
    {
        _context = context;
        _validacionService = validacionService;
    }

    public async Task<ServiceResult> RegistrarRepartidor(RegistroRepartidorDto dto)
    {
        var errorComun = await _validacionService.ValidarEmailYCedulaUnicos(dto.Email, dto.Cedula);
        if (errorComun != null)
            return ServiceResult.Fallo(errorComun);

        var restaurante = await _context.Restaurantes
            .FirstOrDefaultAsync(r => r.RestauranteId == dto.RestauranteId && r.Activo);
        if (restaurante == null)
            return ServiceResult.Fallo("El restaurante seleccionado no existe o no está activo");

        var usuario = new Usuario
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Telefono = dto.Telefono,
            Cedula = dto.Cedula,
            Rol = "Repartidor",
            Activo = true,
            FechaRegistro = DateTime.Now
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var repartidor = new Repartidor
        {
            UsuarioId = usuario.UsuarioId,
            RestauranteId = dto.RestauranteId,
            LatitudActual = restaurante.Latitud,
            LongitudActual = restaurante.Longitud,
            Disponible = false,
            Activo = true
        };

        _context.Repartidores.Add(repartidor);
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new
        {
            usuarioId = usuario.UsuarioId,
            repartidorId = repartidor.RepartidorId,
            mensaje = "Repartidor registrado correctamente"
        });
    }

    public async Task<ServiceResult> ObtenerPerfil(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);
        if (usuario == null)
            return ServiceResult.Fallo("Repartidor no encontrado");

        var repartidor = await _context.Repartidores
            .Include(r => r.Restaurante)
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("Datos de repartidor no encontrados");

        
        return ServiceResult.Ok(new
        {
            usuario.Nombre,
            usuario.Apellido,
            usuario.Email,
            usuario.Telefono,
            usuario.Cedula,
            repartidor.RestauranteId,
            RestauranteNombre = repartidor.Restaurante?.NombreRestaurante,
            repartidor.Disponible
        });
    }

    public async Task<ServiceResult> EditarPerfil(int usuarioId, EditarRepartidorDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);
        if (usuario == null)
            return ServiceResult.Fallo("Repartidor no encontrado");

        var repartidor = await _context.Repartidores
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("Datos de repartidor no encontrados");

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

        // Cedula y RestauranteId no se cambian aqui: son solo de vista
        // Disponible no va a maneja desde este aqui, se maneja desde el panel principal 

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Perfil actualizado correctamente" });
    }
    
    public async Task<ServiceResult> CambiarDisponibilidad(int usuarioId, bool disponible)
    {
        var repartidor = await _context.Repartidores
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId && r.Activo);
        if (repartidor == null)
            return ServiceResult.Fallo("Repartidor no encontrado");

        repartidor.Disponible = disponible;
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Disponibilidad actualizada" });
    }

    public async Task<ServiceResult> DesactivarPerfil(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);
        if (usuario == null)
            return ServiceResult.Fallo("Repartidor no encontrado");

        var repartidor = await _context.Repartidores
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
        if (repartidor != null)
        {
            repartidor.Activo = false;
            repartidor.Disponible = false;
        }

        usuario.Activo = false;
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Perfil desactivado correctamente" });
    }
}