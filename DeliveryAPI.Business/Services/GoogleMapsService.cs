using System.Globalization;
using System.Text.RegularExpressions;
using DeliveryAPI.Business.Services.Interfaces;

namespace DeliveryAPI.Business.Services;

public class GoogleMapsService : IGoogleMapsService
{
    public (decimal lat, decimal lng)? ExtraerCoordenadasDeLink(string link)
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
}