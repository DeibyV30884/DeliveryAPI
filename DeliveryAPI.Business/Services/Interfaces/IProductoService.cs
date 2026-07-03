namespace DeliveryAPI.Business.Services.Interfaces;

public interface IProductoService
{
    Task<ServiceResult> ObtenerProductosPorRestaurante(int restauranteId);
    Task<ServiceResult> ObtenerDetalleProducto(int productoId);
    Task<ServiceResult> BuscarProductos(string termino);
}