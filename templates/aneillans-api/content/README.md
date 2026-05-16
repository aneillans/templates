# Aneillans API Template Output

## Features

- JWT auth with role policies and Keycloak defaults.
- OpenAPI/Swagger docs in development.
- SQLite default with PostgreSQL/MySQL options.
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
