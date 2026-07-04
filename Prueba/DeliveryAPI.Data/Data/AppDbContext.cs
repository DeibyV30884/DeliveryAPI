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
        
        // Restaurante
        modelBuilder.Entity<Restaurante>(entity =>
        {
            entity.Property(r => r.Latitud).HasPrecision(9, 6);
            entity.Property(r => r.Longitud).HasPrecision(9, 6);
        });

        // Cliente
        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.Property(c => c.LatitudPredeterminada).HasPrecision(9, 6);
            entity.Property(c => c.LongitudPredeterminada).HasPrecision(9, 6);
            entity.Property(c => c.Saldo).HasPrecision(10, 2);
        });

        // Repartidor
        modelBuilder.Entity<Repartidor>(entity =>
        {
            entity.Property(r => r.LatitudActual).HasPrecision(9, 6);
            entity.Property(r => r.LongitudActual).HasPrecision(9, 6);
        });

        // Pedido
        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.Property(p => p.LatitudEntrega).HasPrecision(9, 6);
            entity.Property(p => p.LongitudEntrega).HasPrecision(9, 6);
            entity.Property(p => p.Subtotal).HasPrecision(10, 2);
            entity.Property(p => p.ComisionPlataforma).HasPrecision(10, 2);
            entity.Property(p => p.CostoEnvio).HasPrecision(10, 2);
            entity.Property(p => p.Total).HasPrecision(10, 2);
            entity.Property(p => p.DistanciaKm).HasPrecision(6, 2);
        });

        // Producto
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.Property(p => p.Precio).HasPrecision(10, 2);
            entity.Property(p => p.PrecioDescuento).HasPrecision(10, 2);
        });

        // RecargaSaldo
        modelBuilder.Entity<RecargaSaldo>(entity =>
        {
            entity.Property(r => r.Monto).HasPrecision(10, 2);
        });

        base.OnModelCreating(modelBuilder);
    }
}

