namespace DeliveryAPI.Business.Services.Interfaces;

public interface IGoogleMapsService
{
    (decimal lat, decimal lng)? ExtraerCoordenadasDeLink(string link);
}