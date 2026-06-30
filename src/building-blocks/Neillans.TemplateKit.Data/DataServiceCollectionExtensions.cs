using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Neillans.TemplateKit.Data;

public enum DatabaseProvider
{
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

        var providerValue = configuration["Database:Provider"];
        var provider = providerValue is null
            ? DatabaseProvider.PostgreSql
            : Enum.TryParse<DatabaseProvider>(providerValue, ignoreCase: true, out var parsedProvider)
                ? parsedProvider
                : throw new InvalidOperationException($"Unsupported database provider '{providerValue}'. Supported providers: PostgreSql, MySql.");

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
                    throw new InvalidOperationException($"Unsupported database provider '{provider}'. Supported providers: PostgreSql, MySql.");
            }

            configure?.Invoke(options);
        });

        return services;
    }
}
