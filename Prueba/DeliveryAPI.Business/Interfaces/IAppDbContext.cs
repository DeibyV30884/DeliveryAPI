using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Business.Interfaces;

public interface IAppDbContext
{
    DbSet<Usuario> Usuarios { get; set; }
    DbSet<Restaurante> Restaurantes { get; set; }
    DbSet<Repartidor> Repartidores { get; set; }
    DbSet<Cliente> Clientes { get; set; }
    DbSet<Producto> Productos { get; set; }
    DbSet<Pedido> Pedidos { get; set; }
    DbSet<DetallePedido> DetallesPedido { get; set; }
    DbSet<RecargaSaldo> RecargasSaldo { get; set; }
    DbSet<Notificacion> Notificaciones { get; set; }
    DbSet<HorarioRestaurante> HorariosRestaurante { get; set; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
