# Neillans MVC Template Output

## Features

- MVC-first architecture with OIDC auth and role policy support.
- Keycloak-compatible defaults: role checks read the flat `roles` claim, and `Authentication:Oidc:RequireHttpsMetadata` is `false` only in `appsettings.Development.json`.
- Access-denied and error pages.
- Materio integration hook and import script.
- Docker + compose stack.
- Starter xUnit tests.

## Commands

```bash
dotnet restore MvcHost.sln
dotnet test MvcHost.sln
dotnet run --project src/MvcHost/MvcHost.csproj
```

## Docker

```bash
cd docker
docker compose up --build
```

The app runs on http://localhost:8090 and Keycloak on http://localhost:8082. Keycloak imports `docker/keycloak/template-realm-realm.json` on first start. Sign in as `demo-admin` / `demo-admin` (admin role) or `demo-user` / `demo-user`. The admin console login is `admin` / `admin`. These credentials are for local development only.

## Materio

```bash
./scripts/import-materio.sh /path/to/materio-bootstrap-html-aspnet-core-mvc-admin-template-free
```
