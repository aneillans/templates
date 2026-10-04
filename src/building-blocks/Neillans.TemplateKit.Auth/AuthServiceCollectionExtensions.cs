using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Neillans.TemplateKit.Auth;

public static class AuthServiceCollectionExtensions
{
    public static IServiceCollection AddTemplateOidcAuthentication(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<OpenIdConnectOptions>? configureOidc = null)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var section = configuration.GetSection("Authentication:Oidc");
        var requireHttpsMetadata = true;
        if (bool.TryParse(section["RequireHttpsMetadata"], out var parsedRequireHttpsMetadata))
        {
            requireHttpsMetadata = parsedRequireHttpsMetadata;
        }

        services
            .AddAuthentication(options =>
            {
                options.DefaultScheme = "Cookies";
                options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie("Cookies")
            .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
            {
                options.Authority = section["Authority"];
                options.ClientId = section["ClientId"];
                options.ClientSecret = section["ClientSecret"];
                options.RequireHttpsMetadata = requireHttpsMetadata;
                options.ResponseType = "code";
                options.UsePkce = true;
                options.SaveTokens = true;
                options.GetClaimsFromUserInfoEndpoint = true;
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("roles");

                // Keep claim names as issued so the flat "roles" claim (Keycloak realm-role mapper) drives RequireRole.
                options.MapInboundClaims = false;
                options.TokenValidationParameters.NameClaimType = "preferred_username";
                options.TokenValidationParameters.RoleClaimType = "roles";

                configureOidc?.Invoke(options);
            });

        services.AddAuthorizationBuilder()
            .AddPolicy("RequireAdmin", policy => policy.RequireRole("admin"));

        return services;
    }

    public static IServiceCollection AddTemplateJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        var section = configuration.GetSection("Authentication:Jwt");
        var requireHttpsMetadata = true;
        if (bool.TryParse(section["RequireHttpsMetadata"], out var parsedRequireHttpsMetadata))
        {
            requireHttpsMetadata = parsedRequireHttpsMetadata;
        }

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = section["Authority"];
                options.Audience = section["Audience"];
                options.RequireHttpsMetadata = requireHttpsMetadata;
            });

        services.AddAuthorizationBuilder()
            .AddPolicy("RequireAdmin", policy => policy.RequireRole("admin"));

        return services;
    }

    public static AuthenticationBuilder AddKeycloakDefaults(this AuthenticationBuilder builder)
    {
        return builder;
    }
}
