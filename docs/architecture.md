# Architecture

## Design goals

- Keep generated applications thin and move common behavior into reusable packages.
- Make updates low-friction by keeping project-specific customization in clearly scoped locations.
- Default to secure auth, role checks, and observable APIs.

## Building blocks

- `Neillans.TemplateKit.Auth`: OIDC/JWT + role-based authorization wiring.
- `Neillans.TemplateKit.Data`: provider-agnostic EF Core setup (PostgreSQL default, MySQL optional).

## Template packs

- `neillans-api`: API starter with OpenAPI and JWT.
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

- Compose files use `postgres:18` and `quay.io/keycloak/keycloak:26.8` (`start-dev`).
- Keycloak's admin user comes from `KC_BOOTSTRAP_ADMIN_USERNAME` / `KC_BOOTSTRAP_ADMIN_PASSWORD`. The older `KEYCLOAK_ADMIN*` variables are deprecated.
- Postgres 18 stores data under `/var/lib/postgresql/18/docker`. If you add a volume, mount it at `/var/lib/postgresql`, not `/var/lib/postgresql/data`.
- The stacks do not import a realm. Create `template-realm` and its clients (`api-host`, `mvc-host`, `angular-spa`) in the Keycloak admin console before testing sign-in.
