using DeliveryAPI.Business.DTOs;

namespace DeliveryAPI.Business.Services.Interfaces;

public interface IProductoService
{
    Task<ServiceResult> ObtenerProductosPorRestaurante(int restauranteId);
    Task<ServiceResult> ObtenerDetalleProducto(int productoId);
    Task<ServiceResult> BuscarProductos(string termino);

    Task<ServiceResult> ObtenerProductosGestionRestaurante(int usuarioId);
    Task<ServiceResult> CrearProducto(int usuarioId, CrearProductoDto dto);
    Task<ServiceResult> EditarProducto(int usuarioId, int productoId, EditarProductoDto dto);
    Task<ServiceResult> EliminarProducto(int usuarioId, int productoId);
}