using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace API.Data;

/// <summary>
/// Allows SQL Server migrations to be scaffolded without starting the app or connecting to a database.
/// </summary>
public sealed class SqlServerAppDbContextFactory : IDesignTimeDbContextFactory<SqlServerAppDbContext>
{
    public SqlServerAppDbContext CreateDbContext(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .AddJsonFile("appsettings.Local.json", optional: true)
            .Build();

        if (!string.Equals(configuration["DatabaseProvider"], "SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("SqlServerAppDbContext requires DatabaseProvider=SqlServer.");
        }

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection.");

        var options = new DbContextOptionsBuilder<SqlServerAppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new SqlServerAppDbContext(options);
    }
}
