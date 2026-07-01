using System.Globalization;
using System.Text.RegularExpressions;
using DeliveryAPI.Business.Services.Interfaces;

namespace DeliveryAPI.Business.Services;

public class GoogleMapsService : IGoogleMapsService
{
    public (decimal lat, decimal lng)? ExtraerCoordenadasDeLink(string link)
    {
        // Patron 1: @lat,lng (más común en links de navegación)
        var match = Regex.Match(link, @"@(-?\d+\.\d+),(-?\d+\.\d+)");
        if (!match.Success)
            // Patron 2: q=lat,lng 
            match = Regex.Match(link, @"q=(-?\d+\.\d+),(-?\d+\.\d+)");
        if (!match.Success)
            // Patron 3:  !3d lat !4d lng (links de lugar específico)
            match = Regex.Match(link, @"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)");
        if (!match.Success)
            // Patron 4:  /place/ con coordenadas en ll=lat,lng
            match = Regex.Match(link, @"ll=(-?\d+\.\d+),(-?\d+\.\d+)");

        // Si ninguno da las coordenadas, el link no sirve
        if (!match.Success)
            return null;

        var lat = decimal.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture);
        var lng = decimal.Parse(match.Groups[2].Value, CultureInfo.InvariantCulture);
        return (lat, lng);
    }
}