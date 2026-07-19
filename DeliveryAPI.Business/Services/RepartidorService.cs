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
    
    public async Task<ServiceResult> ObtenerHistorialYEstadisticas(
    int usuarioId,
    string? estado,
    DateTime? fecha)
{
    var repartidor = await _context.Repartidores
        .AsNoTracking()
        .FirstOrDefaultAsync(r =>
            r.UsuarioId == usuarioId &&
            r.Activo);

    if (repartidor == null)
        return ServiceResult.Fallo("Repartidor no encontrado");

    var consulta = _context.Pedidos
        .AsNoTracking()
        .Where(p => p.RepartidorId == repartidor.RepartidorId);
    
    if (!string.IsNullOrWhiteSpace(estado) &&
        !estado.Equals("Todos", StringComparison.OrdinalIgnoreCase))
    {
        consulta = consulta.Where(p => p.Estado == estado);
    }
    
    if (fecha.HasValue)
    {
        var fechaInicio = fecha.Value.Date;
        var fechaFin = fechaInicio.AddDays(1);

        consulta = consulta.Where(p =>
            (p.FechaEntrega ?? p.FechaPedido) >= fechaInicio &&
            (p.FechaEntrega ?? p.FechaPedido) < fechaFin);
    }

    var pedidosBase = await consulta
        .OrderByDescending(p => p.FechaEntrega ?? p.FechaPedido)
        .Select(p => new
        {
            p.PedidoId,
            p.DistanciaKm,
            p.DireccionEntrega,
            p.TiempoEstimadoMin,
            p.Estado,
            p.CostoEnvio,
            p.FechaPedido,
            p.FechaEntrega,

            ClienteNombre = p.Cliente != null &&
                            p.Cliente.Usuario != null
                ? p.Cliente.Usuario.Nombre
                : "Cliente",

            ClienteApellido = p.Cliente != null &&
                              p.Cliente.Usuario != null
                ? p.Cliente.Usuario.Apellido
                : null
        })
        .ToListAsync();

    var pedidos = pedidosBase
        .Select(p =>
        {
            var tiempoRealMinutos = p.FechaEntrega.HasValue
                ? (int)Math.Round(
                    (p.FechaEntrega.Value - p.FechaPedido).TotalMinutes)
                : 0;

            var tiempoMinutos = tiempoRealMinutos > 0
                ? tiempoRealMinutos
                : p.TiempoEstimadoMin;

            var entregado = p.Estado.Equals(
                "Entregado",
                StringComparison.OrdinalIgnoreCase);

            var nombreCliente = string.IsNullOrWhiteSpace(p.ClienteApellido)
                ? p.ClienteNombre
                : $"{p.ClienteNombre} {p.ClienteApellido}";

            return new
            {
                p.PedidoId,
                Cliente = nombreCliente,
                p.DistanciaKm,
                Direccion = p.DireccionEntrega,
                TiempoMinutos = tiempoMinutos,
                p.Estado,
                
                Ganancia = entregado
                    ? p.CostoEnvio
                    : 0m,

                p.FechaPedido,
                p.FechaEntrega
            };
        })
        .ToList();

    var pedidosEntregados = pedidos
        .Where(p => p.Estado.Equals(
            "Entregado",
            StringComparison.OrdinalIgnoreCase))
        .ToList();

    var estadisticas = new
    {
        PedidosEntregados = pedidosEntregados.Count,
        GananciasTotales = pedidosEntregados.Sum(p => p.Ganancia)
    };

    return ServiceResult.Ok(new
    {
        Pedidos = pedidos,
        Estadisticas = estadisticas
    });
}
    
}