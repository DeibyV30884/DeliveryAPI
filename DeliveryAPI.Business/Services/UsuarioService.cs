using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DeliveryAPI.Business.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IAppDbContext _context;
    private readonly IConfiguration _configuration;

    private static readonly string[] DiasValidos =
        { "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo" };

    public UsuarioService(IAppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<ServiceResult> Login(LoginDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Activo);

        if (usuario == null)
            return ServiceResult.Fallo("Credenciales incorrectas");

        bool passwordCorrecta = BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash);
        if (!passwordCorrecta)
            return ServiceResult.Fallo("Credenciales incorrectas");

        var token = GenerarToken(usuario);
        return ServiceResult.Ok(new
        {
            token,
            usuarioId = usuario.UsuarioId,
            nombre = usuario.Nombre,
            rol = usuario.Rol
        });
    }

    public async Task<ServiceResult> RegistrarCliente(RegistroClienteDto dto)
    {
        var errorComun = await ValidarEmailYCedulaUnicos(dto.Email, dto.Cedula);
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

    public async Task<ServiceResult> RegistrarRestaurante(RegistroRestauranteDto dto)
    {
        bool emailExiste = await _context.Usuarios.AnyAsync(u => u.Email == dto.Email);
        if (emailExiste)
            return ServiceResult.Fallo("El correo electrónico ya está registrado");

        bool cedulaJuridicaExiste = await _context.Restaurantes
            .AnyAsync(r => r.CedulaJuridica == dto.CedulaJuridica);
        if (cedulaJuridicaExiste)
            return ServiceResult.Fallo("La cédula jurídica ya está registrada");

        if (!dto.AceptaComision)
            return ServiceResult.Fallo("Tiene que aceptar la comisión del 5% para poder registrar su restaurante");

        var coordenadas = ExtraerCoordenadasDeLink(dto.LinkGoogleMaps);
        if (coordenadas == null)
            return ServiceResult.Fallo("No se pudieron extraer coordenadas válidas del link de Google Maps");

        var errorHorario = ValidarHorarios(dto.Horarios);
        if (errorHorario != null)
            return ServiceResult.Fallo(errorHorario);

        var usuario = new Usuario
        {
            Nombre = dto.NombreRestaurante,
            Apellido = null,
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

    public async Task<ServiceResult> RegistrarRepartidor(RegistroRepartidorDto dto)
    {
        var errorComun = await ValidarEmailYCedulaUnicos(dto.Email, dto.Cedula);
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

    private async Task<string?> ValidarEmailYCedulaUnicos(string email, string cedula)
    {
        bool emailExiste = await _context.Usuarios.AnyAsync(u => u.Email == email);
        if (emailExiste)
            return "El correo electrónico ya está registrado";

        bool cedulaExiste = await _context.Usuarios.AnyAsync(u => u.Cedula == cedula);
        if (cedulaExiste)
            return "La cédula ya está registrada";

        return null;
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

    private (decimal lat, decimal lng)? ExtraerCoordenadasDeLink(string link)
    {
        // busca un patron como @9.9333,-84.0833 que es el mas comun, sino usa el de abajo
        var match = Regex.Match(link, @"@(-?\d+\.\d+),(-?\d+\.\d+)");
        if (!match.Success) //Este otro es alternativo pero es bueno validar por si acaso q=9.9333,-84.0833
            match = Regex.Match(link, @"q=(-?\d+\.\d+),(-?\d+\.\d+)");

        // Si ninguno da las coordenadas, el link no sirve
        if (!match.Success)
            return null;

        //aqui guarda la latitud el el grupo 1 y la longitud en el grupo 2
        var lat = decimal.Parse(match.Groups[1].Value, System.Globalization.CultureInfo.InvariantCulture);
        var lng = decimal.Parse(match.Groups[2].Value, System.Globalization.CultureInfo.InvariantCulture);
        return (lat, lng);
    }

    private string GenerarToken(Usuario usuario)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.UsuarioId.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Role, usuario.Rol),
            new Claim(ClaimTypes.Name, string.IsNullOrEmpty(usuario.Apellido)
                ? usuario.Nombre
                : $"{usuario.Nombre} {usuario.Apellido}")
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}