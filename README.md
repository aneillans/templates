# Aneillans Project Templates

Reusable templates and building blocks for new projects with .NET 10 and Angular.

## What you get

- MVC-first frontend template with Materio integration hooks.
- Angular SPA template for apps that need a full client-side experience.
- API template with OpenAPI/Swagger, auth, and health checks.
- OIDC/JWT + role support with Keycloak-ready configuration.
- SQLite-by-default data setup with PostgreSQL/MySQL options.
- Dockerfiles and compose test stacks.
- Unit tests and template smoke-test workflow.
- Packaging and publishing setup for ProGet.

## Repository layout

- `src/building-blocks`: shared NuGet packages for auth and data provider abstractions.
- `templates/aneillans-api`: `dotnet new` API template.
- `templates/aneillans-mvc`: `dotnet new` MVC template.
- `templates/aneillans-angular`: Angular + docker template content.
- `docs`: usage and maintenance guidance.

## Quick start

Local restore is configured to use `nuget.org` only.
ProGet is used for publishing (or as an explicit opt-in source in your environment).

```bash
dotnet build TemplateKit.sln
dotnet pack src/building-blocks/Aneillans.TemplateKit.Auth/Aneillans.TemplateKit.Auth.csproj -c Release
dotnet pack src/building-blocks/Aneillans.TemplateKit.Data/Aneillans.TemplateKit.Data.csproj -c Release
```

Install template packs locally during development:

```bash
dotnet new install ./templates/aneillans-api
dotnet new install ./templates/aneillans-mvc
```

Use template:

```bash
dotnet new aneillans-api -n Sample.Api
dotnet new aneillans-mvc -n Sample.Mvc
```

## Materio integration

This repository does not redistribute Materio assets. Use the script and guidance in `docs/materio-integration.md` to pull and map the free template into a generated MVC app.

## ProGet publishing

Set CI secrets:

- `PROGET_NUGET_SOURCE`
- `PROGET_API_KEY`

The publish workflow packs and pushes TemplateKit packages and template NuGet packages.
