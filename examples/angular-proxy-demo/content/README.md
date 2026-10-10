# Neillans Angular Template Output

## Features

- Angular 22 with standalone components, zoneless change detection, and OnPush by default.
- Requires Node `^22.22.3 || ^24.15.0 || >=26.0.0` (Docker build uses Node 24 LTS).
- Unit tests run on Vitest via `@angular/build:unit-test`.
- Bootstrap 5.3 with a Materio-style theme (SCSS), Bootstrap Icons and self-hosted Inter.
- Layout with a role-aware sidebar, light/dark/system theme, toasts and a confirm dialog.
- ESLint (`angular-eslint`, `typescript-eslint`), Prettier, and a pre-commit hook running `lint-staged`.
- Route guards (`authGuard`, `adminGuard`, `roleGuard(...)`) and a 401 handler that re-authenticates.
- Runtime deployment config: one image serves every environment.
- Translations with Transloco, loaded at runtime so one build serves every language, and a lint check for missing or unused keys.
- Docker image on nginx with SPA deep-link fallback, `/healthz`, and an optional same-origin `/api/` proxy.

## Auth model: `proxy`

Authentication is offloaded to an edge proxy (oauth2-proxy in the bundled stack). The SPA is served through the proxy, the browser holds only the proxy's session cookie, and the proxy adds the bearer token to API requests. The SPA reads the user from `/oauth2/userinfo` and signs in and out through `/oauth2/start` and `/oauth2/sign_out`. Roles come from the userinfo `groups`, which the stack maps from the `roles` claim (`OAUTH2_PROXY_OIDC_GROUPS_CLAIM=roles`).

Request path: browser → oauth2-proxy (`:4180`) → SPA nginx → `/api/` → API. The proxy passes the access token as `X-Forwarded-Access-Token` and the SPA's nginx turns it into `Authorization: Bearer`.

Any proxy exposing `userinfo`, `start?rd=` and `sign_out?rd=` under `AUTH_PROXY_BASE_PATH` works. `angular-auth-oidc-client` stays in `package.json` so both models share one lock file; it is not imported, so it isn't in the bundle.

Feature code depends only on `AuthService` (`src/app/core/auth/auth.service.ts`), so it does not change with the auth model.

## UI

- `src/app/layout/navigation.ts`: sidebar entries. Labels are translation keys. Give an entry `roles` to hide it from other users, and guard its route too.
- `src/app/app-info.ts`: display name (from `dotnet new --title`) and the browser storage prefix.
- `src/styles/_materio-variables.scss`: Bootstrap variable overrides (colours, fonts, radii). `src/styles/_materio-theme.scss`: layout and component rules, plus the light and dark `--app-*` tokens.
- `ThemeService` (`src/app/core/theme`) and the inline script in `src/index.html` share the storage key `demo-angular-proxy.theme`.
- `ToastService` and `ConfirmService` (`src/app/core/ui`) work from any component; see the dashboard for usage.
- `src/app/shared/components`: `PageHeaderComponent`, `EmptyStateComponent` and `StatusBadgeComponent`.
- Bootstrap's JavaScript is not loaded globally. `src/main.ts` imports the dropdown plugin; import others (collapse, tooltip) the same way.
- Replace `public/favicon.svg` and `public/apple-touch-icon.png` (180×180) with your own.

## Translations

Text lives in `public/i18n/<language>.json` and is fetched at runtime with Transloco. Templates use `{{ 'key' | transloco }}`. Code uses `TranslocoService.translate('key')`. Keys defined ahead of time, such as route titles and navigation labels, are wrapped in `marker('key')`. The page title is `<translated route title> · <app title>`.

`I18nService` (`src/app/core/i18n`) picks the language at startup: the user's stored choice (`demo-angular-proxy.language`), then `DEFAULT_LANGUAGE`. It then loads the translations and Angular's locale data, which sets `LOCALE_ID` for date and number pipes. It also sets `<html lang>`, and API requests get an `Accept-Language` header. A language menu appears in the top bar when more than one language is offered. Picking a language reloads the page, because `LOCALE_ID` is fixed at bootstrap.

To add a language:

1. Copy `public/i18n/en-GB.json` to `public/i18n/<id>.json` and translate it. The id is a BCP 47 tag that Angular has locale data for, e.g. `cy` or `fr-FR`.
2. Add an entry to `LANGUAGES` in `src/app/core/i18n/languages.ts`.

The first entry in `LANGUAGES` is the source language, and keys missing from another language fall back to it. `npm run lint` runs `scripts/check-i18n-keys.mjs`, which fails when a key used in `src/` is missing from any language file, or a file has a key nothing uses. It finds keys as string literals in the forms above, so never build a key by concatenation. In specs, `provideTranslocoTesting()` (`src/testing/transloco-testing.ts`) loads the real `en-GB` text.

## Deployment config

`/deployment-config.json` is read at startup. In the container, `docker/40-deployment-config.sh` writes it from environment variables. Unset values fall back to the defaults in `src/app/core/config/deployment-config.ts`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_BASE_URL` | `/api` | Prefix for API calls. |
| `DEFAULT_LANGUAGE` | `en-GB` | Language until the user picks one. |
| `LANGUAGES` | all shipped | Comma-separated language ids to offer, e.g. `en-GB,cy`. |
| `AUTH_PROXY_BASE_PATH` | `/oauth2` | Proxy endpoint prefix. |
| `AUTH_PROXY_SIGN_OUT_REDIRECT` | app root | Where to go after the proxy clears its session. The bundled stack ends the Keycloak session server-side with `OAUTH2_PROXY_BACKEND_LOGOUT_URL`, so it leaves this empty. |
| `API_UPSTREAM` | unset | When set (e.g. `http://api:8080`), nginx proxies `/api/` to it with the prefix stripped. Unset, `/api/` returns 503. |

To add a setting, add it to `DeploymentConfig` and its defaults, then map a variable in the entrypoint script's `MAPPINGS`.

## Commands

```bash
npm ci
npm test
npm start
npm run lint     # ESLint, translation keys, then Prettier in check mode
npm run format   # Prettier, rewriting files
```

`npm ci` installs the pre-commit hook when this folder is the git root or sits directly under it, which is the layout `dotnet new` creates. It runs ESLint and Prettier on staged files. The hook is skipped in CI, without git, or with `HUSKY=0`.

`npm start` proxies `/api/` and `/oauth2/` to the oauth2-proxy at `http://localhost:4180` (see `proxy.conf.json`), so run the Docker stack too. Sign-in returns to `http://localhost:4200` because the stack whitelists it.

## Docker

```bash
cd demo-angular-proxy/docker
docker compose up --build
```

Open `http://localhost:4180`. The SPA container is not published, so everything goes through the proxy.
Users: `demo-admin` / `demo-admin` (admin) and `demo-user` / `demo-user`. The Keycloak realm, passwords and secrets are for local development only.
