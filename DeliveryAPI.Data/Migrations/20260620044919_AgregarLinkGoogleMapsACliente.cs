using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeliveryAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class AgregarLinkGoogleMapsACliente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LinkGoogleMaps",
                table: "Clientes",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LinkGoogleMaps",
                table: "Clientes");
        }
    }
}
