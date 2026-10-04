# Neillans API Template Output

## Features

- JWT auth with role policies and Keycloak defaults.
- OpenAPI/Swagger docs in development.
- PostgreSQL default with MySQL option (Oracle `MySql.EntityFrameworkCore` provider). Set `Database:Provider` to `MySql` to switch.
- Docker + compose stack including Keycloak.
- Starter xUnit tests.

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
