using Microsoft.EntityFrameworkCore;
using DeliveryAPI.Models;

namespace DeliveryAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Todas las tablas, una por entidad
    
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Restaurante> Restaurantes { get; set; }
    public DbSet<Repartidor> Repartidores { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Producto> Productos { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<DetallePedido> DetallesPedido { get; set; }
    public DbSet<RecargaSaldo> RecargasSaldo { get; set; }
    public DbSet<Notificacion> Notificaciones { get; set; }
    public DbSet<HorarioRestaurante> HorariosRestaurante { get; set; }
}