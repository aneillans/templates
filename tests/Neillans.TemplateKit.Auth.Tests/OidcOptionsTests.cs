using FluentAssertions;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace Neillans.TemplateKit.Auth.Tests;

public sealed class OidcOptionsTests
{
    private static OpenIdConnectOptions Resolve(Dictionary<string, string?> settings)
    {
        settings["Authentication:Oidc:ClientId"] = "test-client";
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
        using var provider = new ServiceCollection()
            .AddLogging()
            .AddTemplateOidcAuthentication(configuration)
            .BuildServiceProvider();

        return provider.GetRequiredService<IOptionsMonitor<OpenIdConnectOptions>>()
            .Get(OpenIdConnectDefaults.AuthenticationScheme);
    }

    [Fact]
    public void RolesClaimShouldBeUsedAsIssued()
    {
        var options = Resolve(new() { ["Authentication:Oidc:Authority"] = "https://idp.example/realms/r" });

        options.MapInboundClaims.Should().BeFalse();
        options.TokenValidationParameters.RoleClaimType.Should().Be("roles");
        options.TokenValidationParameters.NameClaimType.Should().Be("preferred_username");
    }

    [Fact]
    public void HttpsMetadataShouldBeRequiredUnlessDisabled()
    {
        Resolve(new() { ["Authentication:Oidc:Authority"] = "https://idp.example/realms/r" })
            .RequireHttpsMetadata.Should().BeTrue();

        Resolve(new()
        {
            ["Authentication:Oidc:Authority"] = "http://localhost:8081/realms/r",
            ["Authentication:Oidc:RequireHttpsMetadata"] = "false",
        }).RequireHttpsMetadata.Should().BeFalse();
    }
}
