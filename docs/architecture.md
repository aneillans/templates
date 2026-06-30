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

- Default provider is PostgreSQL.
- MySQL remains available through configuration.
- Template code avoids hard dependency on a single relational engine.
