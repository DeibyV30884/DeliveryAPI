using DeliveryAPI.Business.DTOs;
using DeliveryAPI.Business.Services.Interfaces;
using DeliveryAPI.Models.Entities;

namespace DeliveryAPI.Business.Services;

public class CalculadorCostosPedido : ICalculadorCostosPedido
{
    // Constantes que se plantearon en los requerimientos del negocio, asi no manejan numeros sueltos 
    private const decimal CostoPorKilometro = 700m;
    private const decimal PorcentajeComisionPlataforma = 0.05m;
    private const double VelocidadPromedioKmPorHora = 35;
    private const double RadioTierraKm = 6371;

    // Se esta en cuenta que Haversine calcula la distancia en linea recta, y que del lado del frontend
    // se esta usando OSRM para poder ver la distancia por calles, el tema es que si calculamos desde el
    // backend con OSRM puede ser que vaya lento o se caiga el dia de la presentacion entonces preferimos 
    // meterle 2km mas a cada ruta para simular ese aumento se tiempo sin que puedan haber errores luego
    private const decimal CorreccionRutaPorCalleKm = 2m;

    
     public ResultadoCalculoPedido Calcular(
        Restaurante restaurante, 
        List<Producto> productosValidados,
        List<DetallePedidoDto> itemsSolicitados,
        decimal latitudEntrega,
        decimal longitudEntrega)
    {
        // El frontend solo va a permitir pedir un producto a la vez, solo se puede cambia la
        // cantidad, siempre se trabaja con un unico tipo de producto en el pedido
        var item = itemsSolicitados[0];
        
        Producto producto = null;
        bool encontrado = false;
        int j = 0;
        while (j < productosValidados.Count && !encontrado)
        {
            if (productosValidados[j].ProductoId == item.ProductoId)
            {
                producto = productosValidados[j];
                encontrado = true;
            }
            j = j + 1;
        }

        decimal precioFinal;
        if (producto.PrecioDescuento != null)
            precioFinal = producto.PrecioDescuento.Value;
        else
            precioFinal = producto.Precio;

        decimal subtotal = precioFinal * item.Cantidad;

        var detalle = new DetallePedido
        {
            ProductoId = item.ProductoId,
            Cantidad = item.Cantidad,
            PrecioUnitario = precioFinal,
            Subtotal = subtotal
        };

        var detalles = new List<DetallePedido>();
        detalles.Add(detalle);
        
        int tiempoPreparacionMin = producto.TiempoPreparacionMin;

        decimal distanciaRectaKm = CalcularDistanciaHaversine(
            (double)restaurante.Latitud, (double)restaurante.Longitud,
            (double)latitudEntrega, (double)longitudEntrega);

        // Distancia final que se usa para cobrar y calcular el tiempo, la recta mas la
        // correccion, como se meciona arriba
        decimal distanciaKm = distanciaRectaKm + CorreccionRutaPorCalleKm;

        decimal costoEnvio = distanciaKm * CostoPorKilometro;
        decimal comisionPlataforma = subtotal * PorcentajeComisionPlataforma;
        decimal total = subtotal + costoEnvio;

        // Tiempo total estimado = tiempo que tarda en prepararse + tiempo que tarda en viajar.
        // El tiempo de viaje lo calculamos con una regla de tres simple:
        // si en 1 hora, el repartidor recorre VelocidadPromedioKmPorHora km,
        // tiempoViajeMin = (distanciaKm / velocidad) * 60
        int tiempoViajeMin = (int)((double)distanciaKm / VelocidadPromedioKmPorHora * 60);
        int tiempoEstimadoMin = tiempoPreparacionMin + tiempoViajeMin;

        var resultado = new ResultadoCalculoPedido
        {
            Detalles = detalles,
            Subtotal = subtotal,
            ComisionPlataforma = comisionPlataforma,
            CostoEnvio = costoEnvio,
            Total = total,
            DistanciaKm = distanciaKm,
            TiempoEstimadoMin = tiempoEstimadoMin
        };

        return resultado;
    }

    // Calcula la distancia en línea recta entre dos puntos del planeta (restaurante y cliente),
    // usando sus coordenadas de latitud/longitud, con la formula de Haversine.
    
    //La fórmula, paso a paso:
    //1-Convertimos todas las coordenadas de grados a radianes, porque las funciones
    //trigonométricas trabajan en radianes y no en grados.
    //2- Calculamos "a", un valor intermedio que combina qué tan diferentes son las
    //latitudes y longitudes entre los dos puntos tomando en cuenta la curvatura.
    //3- Con "a" calculamos la distancia angular: que tanto "arco" de la esfera hay
    //entre los dos puntos, en radianes.
    //4- Multiplicamos esa distancia angular por el radio de la Tierra (en km) para
    //convertir el angulo en una distancia real, en kilometros.
    private decimal CalcularDistanciaHaversine(double latRestaurante, double lonRestaurante, double latCliente, double lonCliente)
    {
        // 1 convertir todo a radianes
        double lat1Rad = GradosARadianes(latRestaurante);
        double lat2Rad = GradosARadianes(latCliente);
        double diferenciaLatitud = GradosARadianes(latCliente - latRestaurante);
        double diferenciaLongitud = GradosARadianes(lonCliente - lonRestaurante);

        // 2 calcular "a" 
        double a = Math.Sin(diferenciaLatitud / 2) * Math.Sin(diferenciaLatitud / 2)
                 + Math.Cos(lat1Rad) * Math.Cos(lat2Rad) 
                  * Math.Sin(diferenciaLongitud / 2) * Math.Sin(diferenciaLongitud / 2);

        // 3 convertir "a" en una distancia angular (en radianes)
        double distanciaAngular = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        // Paso 4: convertir el angulo en distancia real usando el radio de la Tierra
        return (decimal)(RadioTierraKm * distanciaAngular);
    }

    private double GradosARadianes(double grados) => grados * Math.PI / 180;
}