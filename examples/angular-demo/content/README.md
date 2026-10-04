# Neillans Angular Template Output

## Features

- Angular 22 with standalone components, zoneless change detection, and OnPush by default.
- Requires Node `^22.22.3 || ^24.15.0 || >=26.0.0` (Docker build uses Node 24 LTS).
- Unit tests run on Vitest via `@angular/build:unit-test`.
- OIDC support via `angular-auth-oidc-client`.
- Role extraction utility and unit tests.
- Docker image for production static hosting with nginx.

## Commands

```bash
npm ci
npm run test
npm start
```

## Docker

```bash
cd demo-angular/docker
docker compose up --build
```
