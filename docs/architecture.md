# Architecture

## Design goals

- Keep generated applications thin and move common behavior into reusable packages.
- Make updates low-friction by keeping project-specific customization in clearly scoped locations.
- Default to secure auth, role checks, and observable APIs.

## Building blocks

- `Neillans.TemplateKit.Auth`: OIDC/JWT + role-based authorization wiring.
- `Neillans.TemplateKit.Data`: provider-agnostic EF Core setup (PostgreSQL default, MySQL optional).

## Template packs

- `neillans-api`: API starter with OpenAPI and JWT. The OpenAPI document comes from ASP.NET Core's built-in generator (`AddOpenApi`/`MapOpenApi`). Swashbuckle is used only for the Swagger UI (`Swashbuckle.AspNetCore.SwaggerUI`).
- `neillans-mvc`: MVC starter with OIDC and Materio integration hooks.
- `neillans-angular`: SPA starter with OIDC client wiring.

## Pluggable frontend approach

- Vendor template assets are not modified directly.
- Project customizations live in dedicated override locations.
- Re-import scripts make frontend template updates repeatable.

## Database strategy

- Default provider is PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`).
- MySQL is available by setting `Database:Provider` to `MySql`. It uses Oracle's `MySql.EntityFrameworkCore` provider, which tracks EF Core releases. Pomelo was dropped because it has no EF Core 10 release.
- All EF Core packages stay on the same major version as the target framework.
- Template code avoids hard dependency on a single relational engine.

## Container stacks

- Compose files use `postgres:18` and `quay.io/keycloak/keycloak:26.8` (`start-dev --import-realm`).
- Keycloak's admin user comes from `KC_BOOTSTRAP_ADMIN_USERNAME` / `KC_BOOTSTRAP_ADMIN_PASSWORD`. The older `KEYCLOAK_ADMIN*` variables are deprecated.
- Postgres 18 stores data under `/var/lib/postgresql/18/docker`. If you add a volume, mount it at `/var/lib/postgresql`, not `/var/lib/postgresql/data`.
- Each stack imports `docker/keycloak/template-realm-realm.json` (Keycloak requires the `<realm>-realm.json` file name). It defines:
  - realm roles `admin` and `user`;
  - clients `api-host` (bearer-only audience), `mvc-host` (confidential, secret `mvc-host-secret`) and `angular-spa` (public, PKCE);
  - a realm-role mapper on `mvc-host` and `angular-spa` that emits a flat `roles` claim, plus an `api-host` audience mapper;
  - dev users `demo-admin` / `demo-admin` (roles `admin`, `user`) and `demo-user` / `demo-user` (role `user`).
- Keycloak's default token puts roles under `realm_access.roles`, which ASP.NET Core role checks do not read. Any realm you create yourself needs the same `roles` mapper.
- The import is for local development only. It sets `sslRequired` to `none` and contains fixed passwords and a fixed client secret.
- `KC_HOSTNAME` is the browser-facing URL and `KC_HOSTNAME_BACKCHANNEL_DYNAMIC=true` lets containers call `http://keycloak:8080`. Tokens therefore carry the browser-facing issuer, which the API and MVC apps accept because they read it from discovery.
