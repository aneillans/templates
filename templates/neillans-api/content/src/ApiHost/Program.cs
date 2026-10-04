using ApiHost.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Authentication:Jwt:Authority"];
        options.Audience = builder.Configuration["Authentication:Jwt:Audience"];
        options.RequireHttpsMetadata = builder.Configuration.GetValue("Authentication:Jwt:RequireHttpsMetadata", true);
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdmin", policy => policy.RequireRole("admin"));

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var provider = builder.Configuration["Database:Provider"]?.ToLowerInvariant() ?? "postgresql";
    var connectionString = builder.Configuration.GetConnectionString("Default")
        ?? throw new InvalidOperationException("Missing connection string 'Default'.");

    switch (provider)
    {
        case "postgres":
        case "postgresql":
            options.UseNpgsql(connectionString);
            break;
        case "mysql":
            options.UseMySQL(connectionString);
            break;
        default:
            throw new InvalidOperationException($"Unsupported database provider '{provider}'. Supported providers: PostgreSql, MySql.");
    }
});

#if (useSwagger)
// Built-in OpenAPI document generation (also registers the endpoint API explorer).
builder.Services.AddOpenApi();
#endif

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

#if (useSwagger)
if (app.Environment.IsDevelopment())
{
    // Serves the document at /openapi/v1.json; Swagger UI at /swagger renders it.
    app.MapOpenApi();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "v1"));
}
#endif

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .WithName("GetHealth")
    .WithSummary("Health endpoint")
    .AllowAnonymous();

app.MapGet("/secure/admin", () => Results.Ok(new { message = "admin only" }))
    .RequireAuthorization("RequireAdmin")
    .WithName("GetAdminResource")
    .WithSummary("Role-protected endpoint");

app.Run();

public partial class Program;
