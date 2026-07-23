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

    public async Task<ServiceResult> ObtenerUsuarios(
        string? busqueda,
        string? rol,
        int pagina,
        int tamanoPagina)
        {
        pagina = pagina < 1 ? 1 : pagina;
        tamanoPagina = tamanoPagina < 1 ? 10 : tamanoPagina;

        var consulta = _context.Usuarios.AsQueryable();

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            busqueda = busqueda.Trim();

            consulta = consulta.Where(u =>
                u.Nombre.Contains(busqueda) ||
                (u.Apellido != null && u.Apellido.Contains(busqueda)) ||
                u.Email.Contains(busqueda) ||
                (u.Telefono != null && u.Telefono.Contains(busqueda)) ||
                (u.Cedula != null && u.Cedula.Contains(busqueda)));
        }

        if (!string.IsNullOrWhiteSpace(rol) && rol != "Todos")
        {
            consulta = consulta.Where(u => u.Rol == rol);
        }

        var totalUsuarios = await consulta.CountAsync();

        var usuarios = await consulta
            .OrderByDescending(u => u.FechaRegistro)
            .Skip((pagina - 1) * tamanoPagina)
            .Take(tamanoPagina)
            .Select(u => new
            {
                u.UsuarioId,
                u.Nombre,
                u.Apellido,
                u.Email,
                u.Telefono,
                u.Cedula,
                u.Rol,
                u.Activo,
                u.FechaRegistro
            })
            .ToListAsync();

        var totalPaginas = (int)Math.Ceiling(
            totalUsuarios / (double)tamanoPagina
        );

        return ServiceResult.Ok(new
        {
            usuarios,
            paginaActual = pagina,
            tamanoPagina,
            totalUsuarios,
            totalPaginas
        });
    }

    public async Task<ServiceResult> ObtenerResumenUsuarios()
    {
        var clientes = await _context.Usuarios
            .CountAsync(u => u.Rol == "Cliente");

        var restaurantes = await _context.Usuarios
            .CountAsync(u => u.Rol == "Restaurante");

        var repartidores = await _context.Usuarios
            .CountAsync(u => u.Rol == "Repartidor");

        var administradores = await _context.Usuarios
            .CountAsync(u => u.Rol == "Administrador");

        var activos = await _context.Usuarios
            .CountAsync(u => u.Activo);

        var inactivos = await _context.Usuarios
            .CountAsync(u => !u.Activo);

        return ServiceResult.Ok(new
        {
            clientes,
            restaurantes,
            repartidores,
            administradores,
            activos,
            inactivos,
            total = clientes + restaurantes + repartidores + administradores
        });
    }

    public async Task<ServiceResult> CambiarEstadoUsuario(int usuarioId)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

        if (usuario == null)
            return ServiceResult.Fallo("Usuario no encontrado");

        usuario.Activo = !usuario.Activo;

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new
        {
            usuario.UsuarioId,
            usuario.Activo,
            mensaje = usuario.Activo
                ? "Usuario activado correctamente"
                : "Usuario desactivado correctamente"
        });
    }

    // Se calcula desde cuando empieza a contar el periodo pedido en hoy, semana, mes o año
    private DateTime CalcularInicioDePeriodo(string periodo, DateTime ahora)
    {
        if (periodo == "semana")
        {
            int diasDesdeLunes = ((int)ahora.DayOfWeek + 6) % 7;
            return ahora.Date.AddDays(-diasDesdeLunes);
        }

        if (periodo == "mes")
        {
            return new DateTime(ahora.Year, ahora.Month, 1);
        }

        if (periodo == "anio" || periodo == "año")
        {
            return new DateTime(ahora.Year, 1, 1);
        }

        // "hoy" o cualquier valor no reconocido cae aqui
        return ahora.Date;
    }

    public async Task<ServiceResult> ObtenerEstadisticasDashboard(string? periodo)
    {
        string periodoUsado = periodo?.ToLower() ?? "hoy";
        if (string.IsNullOrWhiteSpace(periodoUsado))
        {
            periodoUsado = "hoy";
        }

        var ahora = DateTime.Now;
        var inicioPeriodo = CalcularInicioDePeriodo(periodoUsado, ahora);

        var pedidosEntregadosPeriodo = await _context.Pedidos
            .Where(p => p.Estado == "Entregado"
                        && p.FechaEntrega != null
                        && p.FechaEntrega.Value >= inicioPeriodo
                        && p.FechaEntrega.Value <= ahora)
            .ToListAsync();

        decimal gananciasPeriodo = 0m;
        foreach (var pedido in pedidosEntregadosPeriodo)
        {
            gananciasPeriodo = gananciasPeriodo + pedido.ComisionPlataforma;
        }

        var pedidosPorRestaurante = pedidosEntregadosPeriodo
            .GroupBy(p => p.RestauranteId)
            .Select(g => new
            {
                RestauranteId = g.Key,
                Pedidos = g.Count(),
                Ganancias = g.Sum(p => p.ComisionPlataforma)
            })
            .OrderByDescending(g => g.Ganancias)
            .Take(3)
            .ToList();

        var restauranteIds = pedidosPorRestaurante.Select(p => p.RestauranteId).ToList();

        var restaurantesInfo = await (
            from r in _context.Restaurantes
            join u in _context.Usuarios on r.UsuarioId equals u.UsuarioId
            where restauranteIds.Contains(r.RestauranteId)
            select new { r.RestauranteId, r.NombreRestaurante, u.Email }
        ).ToListAsync();

        var topRestaurantes = new List<object>();
        foreach (var pedidosRestaurante in pedidosPorRestaurante)
        {
            string nombreRestaurante = "—";
            string email = "—";

            var info = restaurantesInfo.FirstOrDefault(r => r.RestauranteId == pedidosRestaurante.RestauranteId);
            if (info != null)
            {
                nombreRestaurante = info.NombreRestaurante;
                email = info.Email;
            }

            topRestaurantes.Add(new
            {
                pedidosRestaurante.RestauranteId,
                NombreRestaurante = nombreRestaurante,
                Email = email,
                pedidosRestaurante.Pedidos,
                pedidosRestaurante.Ganancias
            });
        }

        return ServiceResult.Ok(new
        {
            Periodo = periodoUsado,
            Ganancias = gananciasPeriodo,
            PedidosEntregados = pedidosEntregadosPeriodo.Count,
            TopRestaurantes = topRestaurantes
        });
    }
}