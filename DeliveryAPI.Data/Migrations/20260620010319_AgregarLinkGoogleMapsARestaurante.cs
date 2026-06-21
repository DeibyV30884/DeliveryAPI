using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeliveryAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class AgregarLinkGoogleMapsARestaurante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LinkGoogleMaps",
                table: "Restaurantes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LinkGoogleMaps",
                table: "Restaurantes");
        }
    }
}
