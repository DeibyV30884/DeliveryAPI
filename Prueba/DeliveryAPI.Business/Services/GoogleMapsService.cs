using System.Globalization;
using System.Text.RegularExpressions;
using DeliveryAPI.Business.Services.Interfaces;

namespace DeliveryAPI.Business.Services;

public class GoogleMapsService : IGoogleMapsService
{
    public (decimal lat, decimal lng)? ExtraerCoordenadasDeLink(string link)
    {
        // Patron 1, prioridad: !3d lat !4d lng — coordenadas exactas, es mas especifico que los otros
        var match = Regex.Match(link, @"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)");
        if (!match.Success)
            // Patron 2: q=lat,lng 
            match = Regex.Match(link, @"q=(-?\d+\.\d+),(-?\d+\.\d+)");
        if (!match.Success)
            // Patron 3:  con coordenadas en ll=lat,lng
            match = Regex.Match(link, @"ll=(-?\d+\.\d+),(-?\d+\.\d+)");
        if (!match.Success)
            // Patron 4, ultimo recurso: @lat,lng — solo el centro del viewport
            match = Regex.Match(link, @"@(-?\d+\.\d+),(-?\d+\.\d+)");

        // Si ninguno da las coordenadas, el link no sirve
        if (!match.Success)
            return null;

        var lat = decimal.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture);
        var lng = decimal.Parse(match.Groups[2].Value, CultureInfo.InvariantCulture);
        return (lat, lng);
    }
}