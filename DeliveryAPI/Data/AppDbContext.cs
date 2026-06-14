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
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // se recorren las tablas para conseguir las FK
        foreach (var relationship in modelBuilder.Model.GetEntityTypes()
                     .SelectMany(e => e.GetForeignKeys()))
        {
            // Con esto se le dice a sql server que cuando se borre un registro padre,
            // no hagas nada automático con los hijos"
            // para que se borra nada y solo se desactive con Activo = false,
            // para no perder datos.
            relationship.DeleteBehavior = DeleteBehavior.NoAction;
        }
    }
}