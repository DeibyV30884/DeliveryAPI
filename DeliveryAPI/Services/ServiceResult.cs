namespace DeliveryAPI.Services;

public class ServiceResult
{
    public bool Exito { get; set; }
    public string? Mensaje { get; set; }
    public object? Datos { get; set; }

    public static ServiceResult Ok(object datos) => new()
    {
        Exito = true,
        Datos = datos
    };

    public static ServiceResult Fallo(string mensaje) => new()
    {
        Exito = false,
        Mensaje = mensaje
    };
}