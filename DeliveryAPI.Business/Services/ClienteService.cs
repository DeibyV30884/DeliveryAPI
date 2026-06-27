using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;

namespace DeliveryAPI.Business.Services;

public class ClienteService : IClienteService
{
    private readonly IAppDbContext _context;
    private readonly IUsuarioValidacionService _validacionService;

    public ClienteService(IAppDbContext context, IUsuarioValidacionService validacionService)
    {
        _context = context;
        _validacionService = validacionService;
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
}