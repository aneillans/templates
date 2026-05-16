using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Neillans.TemplateKit.Data;

public enum DatabaseProvider
{
    Sqlite,
    PostgreSql,
    MySql
}

public static class DataServiceCollectionExtensions
{
    public static IServiceCollection AddTemplateDbContext<TContext>(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<DbContextOptionsBuilder>? configure = null)
        where TContext : DbContext
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var provider = DatabaseProvider.Sqlite;
        if (Enum.TryParse<DatabaseProvider>(configuration["Database:Provider"], ignoreCase: true, out var parsedProvider))
        {
            provider = parsedProvider;
        }

        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' was not found.");

        services.AddDbContext<TContext>(options =>
        {
            switch (provider)
            {
                case DatabaseProvider.PostgreSql:
                    options.UseNpgsql(connectionString);
                    break;
                case DatabaseProvider.MySql:
                    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
                    break;
                default:
                    options.UseSqlite(connectionString);
                    break;
            }

            configure?.Invoke(options);
        });

        return services;
    }
}
