using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class RecargaSaldoService : IRecargaSaldoService
{
    private readonly IAppDbContext _context;

    public RecargaSaldoService(IAppDbContext context)
    {
        _context = context;
    }
    public async Task<ServiceResult> BuscarClientes(string termino)
    {
        var clientes = await _context.Clientes
            .Include(c => c.Usuario)
            .Where(c => c.Activo &&
                        c.Usuario != null &&
                        (
                            c.Usuario.Nombre.Contains(termino) ||
                            c.Usuario.Apellido.Contains(termino) ||
                            c.Usuario.Cedula.Contains(termino) ||
                            c.Usuario.Email.Contains(termino)
                        ))
            .Select(c => new
            {
                c.ClienteId,
                c.UsuarioId,
                NombreCompleto = c.Usuario!.Nombre + " " + c.Usuario.Apellido,
                c.Usuario.Cedula,
                c.Usuario.Email,
                c.Saldo
            })
            .ToListAsync();

        return ServiceResult.Ok(clientes);
    }
    
    public async Task<ServiceResult> ObtenerHistorial()
    {
        var historial = await _context.RecargasSaldo
            .Include(r => r.Cliente)
            .ThenInclude(c => c.Usuario)
            .Include(r => r.Admin)
            .OrderByDescending(r => r.Fecha)
            .Select(r => new
            {
                r.RecargaId,
                r.ClienteId,
                Cliente = r.Cliente != null && r.Cliente.Usuario != null
                    ? r.Cliente.Usuario.Nombre + " " + r.Cliente.Usuario.Apellido
                    : "Cliente no disponible",
                RealizadoPor = r.Admin != null
                    ? r.Admin.Nombre + " " + r.Admin.Apellido
                    : "Administrador no disponible",
                r.Monto,
                MetodoPago = r.Nota,
                r.Fecha
            })
            .ToListAsync();

        return ServiceResult.Ok(historial);
    }
    
    
    public async Task<ServiceResult> CrearRecarga(int adminUsuarioId, CrearRecargaSaldoDto dto)
    {
        if (dto.Monto <= 0)
            return ServiceResult.Fallo("El monto debe ser mayor a cero");

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.ClienteId == dto.ClienteId && c.Activo);

        if (cliente == null)
            return ServiceResult.Fallo("Cliente no encontrado o inactivo");

        var adminExiste = await _context.Usuarios
            .AnyAsync(u => u.UsuarioId == adminUsuarioId && u.Activo);

        if (!adminExiste)
            return ServiceResult.Fallo("Administrador no encontrado o inactivo");

        cliente.Saldo += dto.Monto;

        var recarga = new RecargaSaldo
        {
            ClienteId = dto.ClienteId,
            AdminId = adminUsuarioId,
            Monto = dto.Monto,
            Nota = dto.MetodoPago,
            Fecha = DateTime.Now
        };

        _context.RecargasSaldo.Add(recarga);
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new
        {
            recarga.RecargaId,
            cliente.ClienteId,
            cliente.Saldo,
            recarga.Monto,
            MetodoPago = recarga.Nota,
            recarga.Fecha
        });
    }
    
}