# Neillans Angular Template Output

## Features

- Angular latest baseline (standalone components).
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
cd angular-app/docker
docker compose up --build
```
