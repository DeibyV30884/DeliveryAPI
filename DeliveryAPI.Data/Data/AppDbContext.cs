using DeliveryAPI.Business.Interfaces;
using DeliveryAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeliveryAPI.Data.Data;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

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

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Cedula)
            .IsUnique()
            .HasFilter("[Cedula] IS NOT NULL");   // <-- permite múltiples NULL

        modelBuilder.Entity<Restaurante>()
            .HasIndex(r => r.CedulaJuridica).IsUnique();

        foreach (var relationship in modelBuilder.Model.GetEntityTypes()
                     .SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.NoAction;
        }
    }
}
