using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Services;

public class RestauranteService : IRestauranteService
{
    private readonly IAppDbContext _context;
    private readonly IGoogleMapsService _googleMapsService;
    private readonly IUsuarioValidacionService _validacionService;

    private static readonly string[] DiasValidos =
        { "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo" };

    public RestauranteService(
        IAppDbContext context,
        IGoogleMapsService googleMapsService,
        IUsuarioValidacionService validacionService)
    {
        _context = context;
        _googleMapsService = googleMapsService;
        _validacionService = validacionService;
    }

    public async Task<ServiceResult> RegistrarRestaurante(RegistroRestauranteDto dto)
    {
        var errorEmail = await _validacionService.ValidarEmailUnico(dto.Email);
        if (errorEmail != null)
            return ServiceResult.Fallo(errorEmail);

        bool cedulaJuridicaExiste = await _context.Restaurantes
            .AnyAsync(r => r.CedulaJuridica == dto.CedulaJuridica);
        if (cedulaJuridicaExiste)
            return ServiceResult.Fallo("La cédula jurídica ya está registrada");

        if (!dto.AceptaComision)
            return ServiceResult.Fallo("Tiene que aceptar la comisión del 5% para poder registrar su restaurante");

        var coordenadas = _googleMapsService.ExtraerCoordenadasDeLink(dto.LinkGoogleMaps);
        if (coordenadas == null)
            return ServiceResult.Fallo("No se pudieron extraer coordenadas válidas del link de Google Maps");

        var errorHorario = ValidarHorarios(dto.Horarios);
        if (errorHorario != null)
            return ServiceResult.Fallo(errorHorario);

        var usuario = new Usuario
        {
            Nombre = dto.NombreRestaurante,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Telefono = dto.Telefono,
            Cedula = null,
            Rol = "Restaurante",
            Activo = true,
            FechaRegistro = DateTime.Now
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var restaurante = new Restaurante
        {
            UsuarioId = usuario.UsuarioId,
            NombreRestaurante = dto.NombreRestaurante,
            CedulaJuridica = dto.CedulaJuridica,
            Direccion = dto.Direccion,
            LinkGoogleMaps = dto.LinkGoogleMaps,
            Latitud = coordenadas.Value.lat,
            Longitud = coordenadas.Value.lng,
            AceptaComision = dto.AceptaComision,
            Activo = true
        };

        _context.Restaurantes.Add(restaurante);
        await _context.SaveChangesAsync();

        foreach (var h in dto.Horarios.Where(h => h.Abierto))
        {
            _context.HorariosRestaurante.Add(new HorarioRestaurante
            {
                RestauranteId = restaurante.RestauranteId,
                Dia = h.Dia,
                HoraApertura = h.HoraApertura!.Value,
                HoraCierre = h.HoraCierre!.Value
            });
        }
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new
        {
            usuarioId = usuario.UsuarioId,
            restauranteId = restaurante.RestauranteId,
            latitud = restaurante.Latitud,
            longitud = restaurante.Longitud,
            mensaje = "Restaurante registrado correctamente"
        });
    }

    private string? ValidarHorarios(List<HorarioDiaDto> horarios)
    {
        if (!horarios.Any(h => h.Abierto))
            return "Tiene que registrar al menos un día de operación ";

        var diasVistos = new HashSet<string>();
        foreach (var h in horarios)
        {
            if (!DiasValidos.Contains(h.Dia))
                return $"El día '{h.Dia}' no es válido";

            if (!diasVistos.Add(h.Dia))
                return $"El día '{h.Dia}' está duplicado";

            if (h.Abierto)
            {
                if (h.HoraApertura == null || h.HoraCierre == null)
                    return $"Tiene que indicar la hora de apertura y cierre para {h.Dia}";

                if (h.HoraCierre <= h.HoraApertura)
                    return $"La hora de cierre tiene que ser posterior a la apertura para {h.Dia}";
            }
        }

        return null;
    }
    
    public async Task<ServiceResult> ObtenerRestaurantesActivos()
    {
        var restaurantes = await _context.Restaurantes
            .Where(r => r.Activo)
            .Select(r => new { r.RestauranteId, r.NombreRestaurante })
            .ToListAsync();

        return ServiceResult.Ok(restaurantes);
    }
    public async Task<ServiceResult> ObtenerPerfil(int usuarioId)
{
    var usuario = await _context.Usuarios
        .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);
    if (usuario == null)
        return ServiceResult.Fallo("Restaurante no encontrado");

    var restaurante = await _context.Restaurantes
        .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
    if (restaurante == null)
        return ServiceResult.Fallo("Datos de restaurante no encontrados");

    return ServiceResult.Ok(new
    {
        usuario.Email,
        usuario.Telefono,
        restaurante.NombreRestaurante,
        restaurante.CedulaJuridica,
        restaurante.Direccion,
        restaurante.LinkGoogleMaps,
        restaurante.Latitud,
        restaurante.Longitud,
        restaurante.AceptaComision
    });
}

public async Task<ServiceResult> EditarPerfil(int usuarioId, EditarRestauranteDto dto)
{
    
    var usuario = await _context.Usuarios
        .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);
    if (usuario == null)
        return ServiceResult.Fallo("Restaurante no encontrado");

    var restaurante = await _context.Restaurantes
        .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
    if (restaurante == null)
        return ServiceResult.Fallo("Datos de restaurante no encontrados");
    
    usuario.Nombre = dto.NombreRestaurante;
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

    restaurante.NombreRestaurante = dto.NombreRestaurante;
    restaurante.Direccion = dto.Direccion;

    if (!string.IsNullOrWhiteSpace(dto.LinkGoogleMaps))
    {
        var coordenadas = _googleMapsService.ExtraerCoordenadasDeLink(dto.LinkGoogleMaps);
        if (coordenadas == null)
            return ServiceResult.Fallo("No se pudieron extraer coordenadas válidas del link de Google Maps");

        restaurante.LinkGoogleMaps = dto.LinkGoogleMaps;
        restaurante.Latitud = coordenadas.Value.lat;
        restaurante.Longitud = coordenadas.Value.lng;
    }
    await _context.SaveChangesAsync();
    
    return ServiceResult.Ok(new { mensaje = "Perfil actualizado correctamente" });
}

    public async Task<ServiceResult> DesactivarPerfil(int usuarioId)
    {
        var usuario = await _context.Usuarios
           .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId && u.Activo);
        if (usuario == null)
            return ServiceResult.Fallo("Restaurante no encontrado");

        var restaurante = await _context.Restaurantes
            .FirstOrDefaultAsync(r => r.UsuarioId == usuarioId);
        if (restaurante != null)
            restaurante.Activo = false;

        usuario.Activo = false;
        await _context.SaveChangesAsync();

        return ServiceResult.Ok(new { mensaje = "Perfil desactivado correctamente" });
    }
    
}
