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

        // Sacamos el nombre del restaurante a mano, revisando primero si existe
        string? nombreRestaurante = null;
        if (repartidor.Restaurante != null)
        {
            nombreRestaurante = repartidor.Restaurante.NombreRestaurante;
        }

        return ServiceResult.Ok(new
        {
            usuario.Nombre,
            usuario.Apellido,
            usuario.Email,
            usuario.Telefono,
            usuario.Cedula,
            repartidor.RestauranteId,
            RestauranteNombre = nombreRestaurante,
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

    // Calcula que fecha usar para ordenar y filtrar un pedido: la de entrega si ya existe,
    // si no la fecha en la que se hizo el pedido
    private DateTime ObtenerFechaDeReferencia(Pedido pedido)
    {
        if (pedido.FechaEntrega.HasValue)
        {
            return pedido.FechaEntrega.Value;
        }

        return pedido.FechaPedido;
    }

    public async Task<ServiceResult> ObtenerHistorialYEstadisticas(
        int usuarioId,
        string? estado, 
        DateTime? fecha)
    {
        var repartidor = await _context.Repartidores
            .AsNoTracking()
            .FirstOrDefaultAsync(r =>  r.UsuarioId == usuarioId && r.Activo);

        if (repartidor == null)
            return ServiceResult.Fallo("Repartidor no encontrado");

        var consulta = _context.Pedidos
            .AsNoTracking() 
            .Include(p => p.Restaurante) 
            .Include(p => p.Cliente)
            .ThenInclude(c => c.Usuario)
            .Where(p => p.RepartidorId == repartidor.RepartidorId);
        

        if (!string.IsNullOrWhiteSpace(estado) &&
            
            !estado.Equals("Todos", StringComparison.OrdinalIgnoreCase))
        {
            consulta = consulta.Where(p => p.Estado == estado);
        }

        // Traemos los pedidos de la base de datos y hacemos el resto a mano
        var pedidosDeLaBd = await consulta.ToListAsync();

        // Ordenamos del mas reciente al mas viejo
        pedidosDeLaBd = pedidosDeLaBd
            .OrderByDescending(p => ObtenerFechaDeReferencia(p))
            .ToList();

        var pedidos = new List<object>();
        int pedidosEntregadosCount = 0;
        decimal gananciasTotales = 0m;

        foreach (var p in pedidosDeLaBd)
        {
            var fechaDeReferencia = ObtenerFechaDeReferencia(p);

            // Si el usuario pidio filtrar por un dia especifico, revisamos si el pedido cae ahi
            if (fecha.HasValue)
            {
                var fechaInicio = fecha.Value.Date;
                var fechaFin = fechaInicio.AddDays(1);

                if (fechaDeReferencia < fechaInicio || fechaDeReferencia >= fechaFin)
                {
                    continue;}
            }

            // Nombre del cliente
            string nombreCliente = "Cliente";
            if (p.Cliente != null && p.Cliente.Usuario != null)
            {
                if (string.IsNullOrWhiteSpace(p.Cliente.Usuario.Apellido))
                {
                    nombreCliente = p.Cliente.Usuario.Nombre;}
                else
                {
                    nombreCliente = p.Cliente.Usuario.Nombre + " " + p.Cliente.Usuario.Apellido;}
            }

            // Datos del restaurante, necesarios para dibujar la ruta en el mapa
            string? nombreRestaurante = null;
            decimal? latitudRestaurante = null;
            decimal? longitudRestaurante = null;
            if (p.Restaurante != null)
            {
                nombreRestaurante = p.Restaurante.NombreRestaurante;
                latitudRestaurante = p.Restaurante.Latitud;
                longitudRestaurante = p.Restaurante.Longitud;
            }

            
            // Tiempo que tardo el pedido: si ya se entrego usamos el tiempo real, si no el estimado
            int tiempoMinutos;
            if (p.FechaEntrega.HasValue)
            {
                int tiempoReal = (int)Math.Round((p.FechaEntrega.Value - p.FechaPedido).TotalMinutes);
                if (tiempoReal > 0)
                {
                    tiempoMinutos = tiempoReal; }
                
                else
                {
                    tiempoMinutos = p.TiempoEstimadoMin; }
            }
            else
            {
                tiempoMinutos = p.TiempoEstimadoMin;}

            bool entregado = p.Estado.Equals("Entregado", StringComparison.OrdinalIgnoreCase);

            decimal ganancia = 0m;
            if (entregado)
            {
                ganancia = p.CostoEnvio;
                pedidosEntregadosCount = pedidosEntregadosCount + 1;
                gananciasTotales = gananciasTotales + ganancia;
            }

            pedidos.Add(new
            {
                p.PedidoId,
                Cliente = nombreCliente,
                p.DistanciaKm,
                Direccion = p.DireccionEntrega,
                TiempoMinutos = tiempoMinutos,
                p.Estado,
                Ganancia = ganancia,
                p.FechaPedido,
                p.FechaEntrega,

                // Coordenadas de entrega y del restaurante para el mapa
                p.LatitudEntrega,
                p.LongitudEntrega,
                NombreRestaurante = nombreRestaurante,
                LatitudRestaurante = latitudRestaurante,
                LongitudRestaurante = longitudRestaurante
            });
        }

        var estadisticas = new
        {
            PedidosEntregados = pedidosEntregadosCount,
            GananciasTotales = gananciasTotales
        };

        return ServiceResult.Ok(new
        {
            Pedidos = pedidos,
            Estadisticas = estadisticas
        });
    }
}