# Neillans API Template Output

## Features

- JWT auth with role policies and Keycloak defaults.
- OpenAPI 3.1 document from the built-in `Microsoft.AspNetCore.OpenApi` generator at `/openapi/v1.json`, rendered by Swagger UI at `/swagger` (Development only).
- PostgreSQL default with MySQL option (Oracle `MySql.EntityFrameworkCore` provider). Set `Database:Provider` to `MySql` to switch.
- Docker + compose stack including Keycloak.
- Starter xUnit tests.

## Template options

- `--useSwagger false` removes OpenAPI generation, Swagger UI, and their package references.

## Commands

```bash
dotnet restore ApiHost.sln
dotnet test ApiHost.sln
dotnet run --project src/ApiHost/ApiHost.csproj
```

## Docker

```bash
cd docker
docker compose up --build
```

Keycloak imports `docker/keycloak/template-realm-realm.json` on first start. Sign in as `demo-admin` / `demo-admin` (admin role) or `demo-user` / `demo-user`. The admin console login is `admin` / `admin`. These credentials are for local development only.
