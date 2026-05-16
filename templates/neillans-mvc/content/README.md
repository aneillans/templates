# Neillans MVC Template Output

## Features

- MVC-first architecture with OIDC auth and role policy support.
- Keycloak-compatible defaults.
- Materio integration hook and import script.
- Docker + compose stack.
- Starter xUnit tests.

## Commands

```bash
dotnet restore MvcHost.sln
dotnet test MvcHost.sln
dotnet run --project src/MvcHost/MvcHost.csproj
```

## Materio

```bash
./scripts/import-materio.sh /path/to/materio-bootstrap-html-aspnet-core-mvc-admin-template-free
```
