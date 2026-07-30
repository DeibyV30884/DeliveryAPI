using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class PedidoRepartidorService : IPedidoRepartidorService
{
    private readonly IAppDbContext _context;

    // Velocidad fija que usa toda la simulación de movimiento (cliente, repartidor y restaurante)
    private const double VELOCIDAD_KMH = 35.0;
    private const double DURACION_MINIMA_MIN = 1.0;

    public PedidoRepartidorService(IAppDbContext context)
    {
        _context = context;
    }

    private async Task<Repartidor?> ObtenerRepartidorPorUsuario(int usuarioId)
    {
        return await _context.Repartidores
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
    }

    // Arma el nombre completo del cliente revisando primero que los datos existan
    private string ObtenerNombreCliente(Pedido pedido)
    {
        if (pedido.Cliente != null && pedido.Cliente.Usuario != null)
        {
            return pedido.Cliente.Usuario.Nombre + " " + pedido.Cliente.Usuario.Apellido;
        }

        return "Cliente";
    }

    // Convierte los detalles del pedido en una lista
    private List<object> ObtenerProductos(Pedido pedido)
    {
        var productos = new List<object>();

        foreach (var detalle in pedido.DetallesPedido)
        {
            if (detalle.Producto != null)
            {
                productos.Add(new { detalle.Producto.Nombre, detalle.Cantidad });
            }
        }

        return productos;
    }
    
    private double CalcularDuracionViajeMin(decimal distanciaKm)
    {
        double duracion = 0;
        if (distanciaKm > 0)
            duracion = (double)distanciaKm / VELOCIDAD_KMH * 60.0;

        return Math.Max(duracion, DURACION_MINIMA_MIN);
    }

    public async Task<ServiceResult> ObtenerPedidoAsignadoPendiente(int usuarioId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos
            .Include(p => p.Cliente)
            .ThenInclude(c => c.Usuario)
            .Include(p => p.DetallesPedido)
            .ThenInclude(d => d.Producto)
            .Include(p => p.Restaurante)
            .Where(p => p.RepartidorId == repartidor.RepartidorId && p.Estado == "Pendiente")
            .FirstOrDefaultAsync();

        if (pedido == null)
            return ServiceResult.Fallo("No tienes ningún pedido pendiente");

        var resultado = new
        {
            pedido.PedidoId,
            Cliente = ObtenerNombreCliente(pedido),
            pedido.DireccionEntrega,
            pedido.LatitudEntrega,
            pedido.LongitudEntrega,
            pedido.DistanciaKm,
            pedido.TiempoEstimadoMin,
            pedido.Total,
            Productos = ObtenerProductos(pedido),
            Restaurante = pedido.Restaurante == null ? null : new
            {
                pedido.Restaurante.RestauranteId,
                pedido.Restaurante.NombreRestaurante,
                pedido.Restaurante.Latitud,
                pedido.Restaurante.Longitud
            }
        };

        return ServiceResult.Ok(resultado);
    }

    public async Task<ServiceResult> ObtenerPedidoActivo(int usuarioId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos
            .Include(p => p.Cliente)
            .ThenInclude(c => c.Usuario)
            .Include(p => p.DetallesPedido)
            .ThenInclude(d => d.Producto)
            .Include(p => p.Restaurante)
            .Where(p => p.RepartidorId == repartidor.RepartidorId && p.Estado == "EnCamino")
            .FirstOrDefaultAsync();

        if (pedido == null)
            return ServiceResult.Fallo("No tiene ningún pedido activo en este momento");
        
        double fraccion = 0;
        double duracionViajeMin = CalcularDuracionViajeMin(pedido.DistanciaKm);
        double tiempoRestanteMin = duracionViajeMin;
        bool yaLlego = false;

        if (pedido.FechaInicioEnCamino.HasValue)
        {
            var minutosTranscurridos = (DateTime.Now - pedido.FechaInicioEnCamino.Value).TotalMinutes;

            fraccion = minutosTranscurridos / duracionViajeMin;
            if (fraccion > 1) fraccion = 1;
            if (fraccion < 0) fraccion = 0;

            tiempoRestanteMin = duracionViajeMin - minutosTranscurridos;
            if (tiempoRestanteMin < 0) tiempoRestanteMin = 0;

            yaLlego = fraccion >= 1;
        }

        var resultado = new
        {
            pedido.PedidoId,
            Cliente = ObtenerNombreCliente(pedido),
            pedido.DireccionEntrega,
            pedido.LatitudEntrega,
            pedido.LongitudEntrega,
            pedido.DistanciaKm,
            pedido.TiempoEstimadoMin,
            pedido.Total,
            pedido.CostoEnvio,
            Productos = ObtenerProductos(pedido),
            Restaurante = pedido.Restaurante == null ? null : new
            {
                pedido.Restaurante.RestauranteId,
                pedido.Restaurante.NombreRestaurante,
                pedido.Restaurante.Latitud,
                pedido.Restaurante.Longitud
            },
            Fraccion = fraccion,
            TiempoRestanteMin = Math.Round(tiempoRestanteMin),
            YaLlego = yaLlego
        };

        return ServiceResult.Ok(resultado);
    }

    public async Task<ServiceResult> AceptarPedido(int usuarioId, int pedidoId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos.FirstOrDefaultAsync(p => p.PedidoId == pedidoId);
        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        if (pedido.RepartidorId != repartidor.RepartidorId)
            return ServiceResult.Fallo("Este pedido no te fue asignado a ti");

        if (pedido.Estado != "Pendiente")
            return ServiceResult.Fallo("Este pedido ya no está pendiente de respuesta");

        pedido.Estado = "EnCamino";
        pedido.FechaInicioEnCamino = DateTime.Now; // arrancamos el cronómetro de la emulación
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { pedido.PedidoId, pedido.Estado });
    }

    public async Task<ServiceResult> DevolverPedido(int usuarioId, int pedidoId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos.FirstOrDefaultAsync(p => p.PedidoId == pedidoId);
        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        if (pedido.RepartidorId != repartidor.RepartidorId)
            return ServiceResult.Fallo("Este pedido no te fue asignado a ti");

        if (pedido.Estado != "Pendiente")
            return ServiceResult.Fallo("Ya no puedes devolver este pedido, revisa su estado actual");

        pedido.RepartidorId = null;
        repartidor.Disponible = true;

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { pedido.PedidoId, pedido.Estado });
    }

    public async Task<ServiceResult> ConfirmarEntrega(int usuarioId, int pedidoId, string codigoConfirmacion)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos.FirstOrDefaultAsync(p => p.PedidoId == pedidoId);
        if (pedido == null)
            return ServiceResult.Fallo("Pedido no encontrado");

        if (pedido.RepartidorId != repartidor.RepartidorId)
            return ServiceResult.Fallo("Este pedido no te fue asignado a ti");

        if (pedido.Estado != "EnCamino")
            return ServiceResult.Fallo("Este pedido no está en camino, no se puede confirmar entrega");

        if (pedido.CodigoConfirmacion != codigoConfirmacion)
            return ServiceResult.Fallo("El código de confirmación no coincide");

        pedido.Estado = "Entregado";
        pedido.FechaEntrega = DateTime.Now;
        pedido.FechaInicioRegreso = DateTime.Now;
        
        repartidor.Disponible = false;

        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { pedido.PedidoId, pedido.Estado, pedido.FechaEntrega });
    }

    public async Task<ServiceResult> ObtenerEstadoRegreso(int usuarioId)
    {
        var repartidor = await ObtenerRepartidorPorUsuario(usuarioId);
        if (repartidor == null)
            return ServiceResult.Fallo("No se encontró un repartidor asociado a este usuario");

        var pedido = await _context.Pedidos
            .Include(p => p.Restaurante)
            .Where(p => p.RepartidorId == repartidor.RepartidorId
                     && p.Estado == "Entregado"
                     && p.FechaInicioRegreso != null)
            .OrderByDescending(p => p.FechaEntrega)
            .FirstOrDefaultAsync();

        if (pedido == null || repartidor.Disponible)
            return ServiceResult.Ok(new { Regresando = false, Disponible = repartidor.Disponible });
        
        double duracionViajeMin = CalcularDuracionViajeMin(pedido.DistanciaKm);
        var minutosTranscurridos = (DateTime.Now - pedido.FechaInicioRegreso!.Value).TotalMinutes;

        double fraccion = minutosTranscurridos / duracionViajeMin;
        if (fraccion > 1) fraccion = 1;
        if (fraccion < 0) fraccion = 0;

        // El regreso va al reves: de la entrega hacia el restaurante
        var latOrigen = (double)pedido.LatitudEntrega;
        var lngOrigen = (double)pedido.LongitudEntrega;
        var latDestino = (double)pedido.Restaurante!.Latitud;
        var lngDestino = (double)pedido.Restaurante.Longitud;

        var latActual = latOrigen + fraccion * (latDestino - latOrigen);
        var lngActual = lngOrigen + fraccion * (lngDestino - lngOrigen);

        var yaLlego = fraccion >= 1;

        // Automáticamente, apenas termina de recorrer la distancia de regreso,
        // el repartidor vuelve a quedar disponible sin que tenga que hacer nada.
        if (yaLlego)
        {
            repartidor.Disponible = true;
            pedido.FechaInicioRegreso = null;

            await _context.SaveChangesAsync();
        }

        return ServiceResult.Ok(new
        {
            Regresando = !yaLlego,
            Disponible = repartidor.Disponible,
            LatitudActual = latActual,
            LongitudActual = lngActual,
            YaLlego = yaLlego,
            Fraccion = fraccion,
            // Puntos fijos del viaje de regreso, para que el frontend pida la ruta real a OSRM
            Origen = new { Latitud = pedido.LatitudEntrega, Longitud = pedido.LongitudEntrega },
            Destino = new
            {
                Latitud = pedido.Restaurante.Latitud,
                Longitud = pedido.Restaurante.Longitud,
                Nombre = pedido.Restaurante.NombreRestaurante
            }
        });
    }
    
    private DateTime ObtenerFechaDeReferencia(Pedido pedido)
    {
        if (pedido.FechaEntrega.HasValue)
        {
            return pedido.FechaEntrega.Value;
        }

        return pedido.FechaPedido;
    }

    // Se calcula desde cuando empieza a contar el periodo pedido en hoy, semana, mes o año
    // (mismo criterio que usa AdministradorService para su dashboard)
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
        return ahora.Date;
    }

    public async Task<ServiceResult> ObtenerHistorialYEstadisticas(
        int usuarioId,
        string? estado,
        string? periodo)
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

        // Periodo a usar para filtrar (hoy, semana, mes, anio), igual que en el dashboard de admin
        string periodoUsado = periodo?.ToLower() ?? "hoy";
        if (string.IsNullOrWhiteSpace(periodoUsado))
        {
            periodoUsado = "hoy";
        }

        var ahora = DateTime.Now;
        var inicioPeriodo = CalcularInicioDePeriodo(periodoUsado, ahora);

        var pedidos = new List<object>();
        int pedidosEntregadosCount = 0;
        decimal gananciasTotales = 0m;

        foreach (var p in pedidosDeLaBd)
        {
            var fechaDeReferencia = ObtenerFechaDeReferencia(p);

            // Filtramos por el periodo seleccionado (hoy / semana / mes / año)
            if (fechaDeReferencia < inicioPeriodo || fechaDeReferencia > ahora)
            {
                continue;
            }

            // Nombre del cliente
            string nombreCliente = "Cliente";
            if (p.Cliente != null && p.Cliente.Usuario != null)
            {
                if (string.IsNullOrWhiteSpace(p.Cliente.Usuario.Apellido))
                {
                    nombreCliente = p.Cliente.Usuario.Nombre;
                }
                else
                {
                    nombreCliente = p.Cliente.Usuario.Nombre + " " + p.Cliente.Usuario.Apellido;
                }
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

            // Tiempo que tardo el pedido: si ya se entrego usamos el tiempo real del viaje
            // (desde que el repartidor lo aceptó y arrancó, no desde que el cliente lo pidió,
            // porque el pedido puede quedarse "Pendiente" un buen rato antes de ser aceptado
            // y ese tiempo de espera no es parte del viaje de entrega). Si no, usamos el estimado.
            int tiempoMinutos;
            if (p.FechaEntrega.HasValue && p.FechaInicioEnCamino.HasValue)
            {
                int tiempoReal = (int)Math.Round((p.FechaEntrega.Value - p.FechaInicioEnCamino.Value).TotalMinutes);
                if (tiempoReal > 0)
                {
                    tiempoMinutos = tiempoReal;
                }
                else
                {
                    tiempoMinutos = p.TiempoEstimadoMin;
                }
            }
            else
            {
                tiempoMinutos = p.TiempoEstimadoMin;
            }

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