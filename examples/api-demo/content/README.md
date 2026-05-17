# Neillans API Template Output

## Features

- JWT auth with role policies and Keycloak defaults.
- OpenAPI/Swagger docs in development.
- SQLite default with PostgreSQL/MySQL options.
- Docker + compose stack including Keycloak.
- Starter xUnit tests.

## Commands

```bash
dotnet restore DemoApi.sln
dotnet test DemoApi.sln
dotnet run --project src/DemoApi/DemoApi.csproj
```

## Docker

```bash
cd docker
docker compose up --build
```
