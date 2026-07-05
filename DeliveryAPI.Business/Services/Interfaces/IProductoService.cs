using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IProductoService
{
    Task<ServiceResult> ObtenerProductosPorRestaurante(int restauranteId);
    Task<ServiceResult> ObtenerDetalleProducto(int productoId);
    Task<ServiceResult> BuscarProductos(string termino);

    Task<ServiceResult> ObtenerProductosGestionRestaurante(int restauranteId);
    Task<ServiceResult> CrearProducto(CrearProductoDto dto);
    Task<ServiceResult> EditarProducto(int productoId, EditarProductoDto dto);
    Task<ServiceResult> EliminarProducto(int productoId);
}
