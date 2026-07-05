using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class ClienteService : IClienteService
{
    private readonly IAppDbContext _context;
    private readonly IUsuarioValidacionService _validacionService;
    private readonly IGoogleMapsService _googleMapsService;

    public ClienteService(IAppDbContext context, IUsuarioValidacionService validacionService, IGoogleMapsService googleMapsService)
    {
        _context = context;
        _validacionService = validacionService;
        _googleMapsService = googleMapsService;
    }

    public async Task<ServiceResult> RegistrarCliente(RegistroClienteDto dto)
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
            Rol = "Cliente",
            Activo = true,
            FechaRegistro = DateTime.Now
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var cliente = new Cliente
        {
            UsuarioId = usuario.UsuarioId,
            DireccionPredeterminada = null,
            LinkGoogleMaps = null,
            LatitudPredeterminada = null,
            LongitudPredeterminada = null,
            Saldo = 0,
            Activo = true
        };

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new
        {
            usuarioId = usuario.UsuarioId,
            clienteId = cliente.ClienteId,
            mensaje = "Cliente registrado correctamente"
        });
    }

    public async Task<ServiceResult> ObtenerPerfil(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);
        if (usuario == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);
        if (cliente == null)
            return ServiceResult.Fallo("Datos de cliente no encontrados");

        return ServiceResult.Ok(new
        {
            usuario.Nombre,
            usuario.Apellido,
            usuario.Email,
            usuario.Telefono,
            usuario.Cedula,
            cliente.DireccionPredeterminada,
            cliente.LinkGoogleMaps,
            cliente.LatitudPredeterminada,
            cliente.LongitudPredeterminada,
            cliente.Saldo
        });
    }

    public async Task<ServiceResult> EditarPerfil(int usuarioId, EditarClienteDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);
        if (usuario == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);
        if (cliente == null)
            return ServiceResult.Fallo("Datos de cliente no encontrados");

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

        if (!string.IsNullOrWhiteSpace(dto.LinkGoogleMaps))
        {
            var coordenadas = _googleMapsService.ExtraerCoordenadasDeLink(dto.LinkGoogleMaps);
            if (coordenadas == null)
                return ServiceResult.Fallo("No se pudieron extraer coordenadas válidas del link de Google Maps");

            cliente.LinkGoogleMaps = dto.LinkGoogleMaps;
            cliente.LatitudPredeterminada = coordenadas.Value.lat;
            cliente.LongitudPredeterminada = coordenadas.Value.lng;
        }

        cliente.DireccionPredeterminada = dto.DireccionPredeterminada;
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Perfil actualizado correctamente" });
    }

    public async Task<ServiceResult> DesactivarPerfil(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);
        if (usuario == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);
        if (cliente != null)
            cliente.Activo = false;

        usuario.Activo = false;
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Perfil desactivado correctamente" });
    }

    public async Task<ServiceResult> ObtenerSaldo(int usuarioId)
    {
        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId && c.Activo);
        if (cliente == null)
            return ServiceResult.Fallo("Cliente no encontrado");

        return ServiceResult.Ok(new { cliente.Saldo });
    }
}