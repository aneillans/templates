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
- `neillans-angular`: SPA starter with a Bootstrap/Materio layout, light and dark themes, route guards, runtime deployment config and a choice of auth model (`--auth oidc|proxy`).

## Angular auth models

`dotnet new neillans-angular --auth <model>` picks where authentication happens:

- `oidc` (default): the SPA runs authorisation code + PKCE with `angular-auth-oidc-client` against the `angular-spa` client and attaches the access token to `/api` requests.
- `proxy`: oauth2-proxy owns the session and is the only public entry point. The browser holds a session cookie and never sees a token. oauth2-proxy forwards the access token as `X-Forwarded-Access-Token`; the SPA container's nginx turns it into `Authorization: Bearer` when proxying `/api/` to the API.

Both models implement the abstract `AuthService` (`src/app/core/auth/auth.service.ts`), registered by `auth.providers.ts`. Guards, interceptors and features depend only on that class. The template keeps both implementations in its raw content and uses `template.json` source modifiers to exclude one and rename the other's provider file. Shared files use `//#if (AuthOidc)` / `//#if (AuthProxy)` blocks that only add content, so the raw content still builds and behaves as `oidc`.

In both models the API sees an access token from the realm with the `roles` claim and the `api-host` audience, so the API needs no changes.

The SPA reads `/deployment-config.json` at startup, written by the container entrypoint from environment variables, so one image serves every environment. `API_UPSTREAM` makes the SPA's nginx proxy `/api/` to the API, keeping the browser same-origin (no CORS).

## Angular UI shell

Styles are Bootstrap 5.3 compiled from SCSS. `src/styles.scss` loads Bootstrap with the overrides in `src/styles/_materio-variables.scss`, then the layout rules in `src/styles/_materio-theme.scss`, so Bootstrap upgrades don't touch project styling. The Materio values are the same tokens PostyFox uses. Fonts (Inter) and Bootstrap Icons are bundled from npm, so the app makes no third-party requests.

Signed-in routes render inside `MainLayoutComponent`. Its sidebar comes from `src/app/layout/navigation.ts`, and items with `roles` are hidden from other users. `ThemeService` sets `data-bs-theme` on `<html>`, and an inline script in `index.html` applies the stored choice before first paint. `ToastService` and `ConfirmService` hold their state in signals and are rendered once in `AppComponent`.

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
  - clients `api-host` (bearer-only audience), `mvc-host` (confidential, secret `mvc-host-secret`), `angular-spa` (public, PKCE) and `oauth2-proxy` (confidential, secret `oauth2-proxy-secret`, for `--auth proxy`);
  - a realm-role mapper on `mvc-host`, `angular-spa` and `oauth2-proxy` that emits a flat `roles` claim, plus an `api-host` audience mapper;
  - dev users `demo-admin` / `demo-admin` (roles `admin`, `user`) and `demo-user` / `demo-user` (role `user`).
- Keycloak's default token puts roles under `realm_access.roles`, which ASP.NET Core role checks do not read. Any realm you create yourself needs the same `roles` mapper.
- The import is for local development only. It sets `sslRequired` to `none` and contains fixed passwords and a fixed client secret.
- `KC_HOSTNAME` is the browser-facing URL and `KC_HOSTNAME_BACKCHANNEL_DYNAMIC=true` lets containers call `http://keycloak:8080`. Tokens therefore carry the browser-facing issuer, which the API and MVC apps accept because they read it from discovery.
- oauth2-proxy runs with OIDC discovery skipped for the same reason: it sends the browser to `localhost:8081` but redeems codes and fetches keys from `keycloak:8080`, and checks the browser-facing issuer.
