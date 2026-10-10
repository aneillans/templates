# Neillans Project Templates

Reusable templates and building blocks for new projects with .NET 10 and Angular.

## What you get

- MVC-first frontend template with Materio integration hooks.
- Angular SPA template for apps that need a full client-side experience.
- API template with OpenAPI/Swagger, auth, and health checks.
- OIDC/JWT + role support with Keycloak-ready configuration.
- PostgreSQL-by-default data setup with MySQL option.
- Dockerfiles and compose test stacks.
- Unit tests and template smoke-test workflow.
- Packaging and publishing setup for ProGet.

## Repository layout

- `src/building-blocks`: shared NuGet packages for auth and data provider abstractions.
- `templates/neillans-api`: `dotnet new` API template.
- `templates/neillans-mvc`: `dotnet new` MVC template.
- `templates/neillans-angular`: Angular + docker template content, with auth in the SPA (`--auth oidc`) or offloaded to oauth2-proxy (`--auth proxy`).
- `examples`: full generated demos used to validate template output end-to-end.
- `docs`: usage and maintenance guidance.

## Quick start

Local restore is configured to use `nuget.org` only.
ProGet is used for publishing (or as an explicit opt-in source in your environment).

`TemplateKit.sln` contains the building-block packages and their tests. Template packs are packed separately.

```bash
dotnet build TemplateKit.sln
dotnet test TemplateKit.sln
dotnet pack src/building-blocks/Neillans.TemplateKit.Auth/Neillans.TemplateKit.Auth.csproj -c Release
dotnet pack src/building-blocks/Neillans.TemplateKit.Data/Neillans.TemplateKit.Data.csproj -c Release
```

Install template packs locally during development:

```bash
dotnet new install ./templates/neillans-api/content
dotnet new install ./templates/neillans-mvc/content
dotnet new install ./templates/neillans-angular/content
```

Install from package feed (consumer machines):

```bash
dotnet new install Neillans.Templates.Api --nuget-source https://packages.neillans.co.uk/nuget/dotNet/v3/index.json
dotnet new install Neillans.Templates.Mvc --nuget-source https://packages.neillans.co.uk/nuget/dotNet/v3/index.json
dotnet new install Neillans.Templates.Angular --nuget-source https://packages.neillans.co.uk/nuget/dotNet/v3/index.json
```

Use template:

```bash
dotnet new neillans-api -n Sample.Api
dotnet new neillans-mvc -n Sample.Mvc
```

See full runnable examples in `examples/README.md`.

## Materio integration

This repository does not redistribute Materio assets. Use the script and guidance in `docs/materio-integration.md` to pull and map the free template into a generated MVC app.

## Packages

Packages of these templates can be found on the ProGet feed:

- https://packages.neillans.co.uk/nuget/dotNet/v3/index.json