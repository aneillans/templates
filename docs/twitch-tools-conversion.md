# Converting twitch-tools to TemplateKit

This guide maps the practical steps to migrate the twitch-tools solution to the TemplateKit conventions and reusable building blocks.

## Scope

- Host app: `src/TwitchTools.Web`
- Runtime: .NET 10
- Auth provider: Keycloak (OIDC)
- Database: PostgreSQL via EF Core

## 1) Add TemplateKit dependencies

Add TemplateKit package references to `src/TwitchTools.Web/TwitchTools.Web.csproj`.

If packages are published:

```xml
<ItemGroup>
  <PackageReference Include="Aneillans.TemplateKit.Auth" Version="1.0.0" />
  <PackageReference Include="Aneillans.TemplateKit.Data" Version="1.0.0" />
</ItemGroup>
```

If consuming locally before publishing:

```xml
<ItemGroup>
  <ProjectReference Include="../../templates/src/building-blocks/Aneillans.TemplateKit.Auth/Aneillans.TemplateKit.Auth.csproj" />
  <ProjectReference Include="../../templates/src/building-blocks/Aneillans.TemplateKit.Data/Aneillans.TemplateKit.Data.csproj" />
</ItemGroup>
```

## 2) Replace OIDC auth wiring in Program.cs

In `src/TwitchTools.Web/Program.cs`, replace the custom `AddAuthentication().AddCookie().AddOpenIdConnect(...)` block with:

```csharp
builder.Services.AddTemplateOidcAuthentication(builder.Configuration, options =>
{
    // Optional overrides for twitch-tools compatibility.
    var metadataAddress = builder.Configuration["Keycloak:MetadataAddress"];
    if (!string.IsNullOrWhiteSpace(metadataAddress))
    {
        options.MetadataAddress = metadataAddress;
    }

    // Keep custom claim/event wiring here if needed.
    // options.Events = ...
});
```

Notes:

- `AddTemplateOidcAuthentication` now accepts `Action<OpenIdConnectOptions>?` so project-specific overrides can be applied without forking defaults.
- If desired, move config keys to `Authentication:Oidc:*` and remove `KeycloakOptions` over time.

## 3) Replace DbContext registration

In `src/TwitchTools.Web/Program.cs`, replace custom `AddDbContext<AppDbContext>(...)` setup with:

```csharp
builder.Services.AddTemplateDbContext<AppDbContext>(builder.Configuration, options =>
{
    // Keep any project-specific EF options here (if needed).
});
```

Configuration shape expected by TemplateKit:

```json
{
  "Database": {
    "Provider": "PostgreSql"
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=twitchtools;Username=postgres;Password=postgres"
  }
}
```

If the app currently uses `ConnectionStrings:DefaultConnection`, either:

- Rename it to `ConnectionStrings:Default`, or
- Add a small compatibility bridge in config/startup before fully standardizing.

## 4) Align repository build conventions

Adopt these repo-level files in twitch-tools:

- `Directory.Build.props`
- `Directory.Packages.props`
- `global.json`

Then remove inline package versions from `.csproj` files where centrally managed.

## 5) Normalize package versions

Ensure EF Core and provider packages are version-aligned. Keep all EF-related packages on the same major/minor train to avoid restore/runtime conflicts.

## 6) Align local NuGet source behavior

Use local restore sources for development (for example `nuget.org`) and keep ProGet as a publish target in CI/CD, not an always-on local restore source.

## 7) Update docker-compose env keys

Current twitch-tools uses `Keycloak__*` keys. TemplateKit defaults are under `Authentication__Oidc__*`.

Choose one strategy:

- Preferred: migrate env/config keys to `Authentication__Oidc__*`.
- Transitional: keep `Keycloak__*` and map into OIDC options via the override callback shown above.

## 8) CI workflow alignment

Update GitHub workflows to follow TemplateKit structure:

- Build + test in CI
- Optional template smoke tests for generated outputs
- Package/publish workflow that pushes to ProGet only on release/tag/manual publish

## 9) Suggested migration order

1. Add references (Step 1).
2. Convert auth (Step 2) and validate login flow.
3. Convert data registration (Step 3) and run migrations.
4. Apply repo conventions (Step 4).
5. Align Docker/compose env naming (Step 7).
6. Align CI/publish pipelines (Step 8).

## 10) Validation checklist

- `dotnet restore` succeeds.
- `dotnet build -c Release` succeeds.
- Auth challenge/redirect works with Keycloak.
- Admin authorization policy still behaves as expected.
- EF migrations apply and app starts against PostgreSQL.
- Docker compose stack starts and health checks pass.
