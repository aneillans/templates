# TODO: Angular template parity with other projects

Every item applies to `templates/neillans-angular`. Run `scripts/regenerate-angular-examples.sh` after each change to refresh `examples/angular-demo` (oidc) and `examples/angular-proxy-demo` (proxy).

## Auth models

The template supports both, selected by a `dotnet new` parameter (`--auth oidc|proxy`):

- `oidc`: auth in the SPA. `angular-auth-oidc-client`, PKCE, tokens held by the browser, bearer token attached by the interceptor. Default.
- `proxy`: auth offloaded to an edge proxy such as oauth2-proxy. Session cookie only, browser holds no tokens, SPA reads `/oauth2/userinfo` and redirects to `/oauth2/start` / `sign_out`. 

- [x] Add the `auth` choice parameter to `template.json` and use conditional content/preprocessor blocks so the unused model's files are excluded from output. `angular-auth-oidc-client` stays in `package.json` for both, so they share one lock file; it isn't imported in `proxy`.
- [x] Define one `AuthService` contract (`user`, `isAdmin`, `loaded`, `displayName`, `email`, `signIn(returnTo)`, `signOut()`) with an implementation per model, so guards, layout and features never know which is in use.
- [x] Keep the proxy endpoint prefix (`/oauth2`) configurable, so other proxies (Pomerium, Traefik forward-auth, Azure Easy Auth) can be swapped in.
- [x] Generate both in `scripts/verify-templates.sh` and CI (`smoke-spa-oidc`, `smoke-spa-proxy`).
- [x] One example per model: `examples/angular-demo`, `examples/angular-proxy-demo`.
- [x] Document both models, when to pick each, and how the API validates the token in each (bearer from SPA vs bearer injected by the proxy).

## App bootstrap and structure

- [x] Move providers from `main.ts` into `app.config.ts` (`ApplicationConfig`).
- [x] `provideHttpClient(withInterceptors([...]))`. The template does not provide `HttpClient` at all.
- [x] Router features: `withComponentInputBinding()`, `withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })`.
- [x] Lazy-loaded routes (`loadComponent`) under a guarded parent route that renders `MainLayoutComponent`, with a `**` fallback.
- [x] `provideAppInitializer` chain: load user, deployment config, translations and theme before first render. Each must never throw.
- [x] `LOCALE_ID` + `registerLocaleData` (configurable, default `en-GB`). Per language at runtime: `I18nService` lazy-loads the locale data and `LOCALE_ID` reads it after the initializers.

## Auth and authorisation

- [x] `authGuard`: redirect to sign-in when there is no user. The template has no guards; `/admin` is open.
- [x] `adminGuard` (plus `roleGuard(...roles)`): redirect when the user lacks the admin role. Roles come from ID token claims (existing `extractRoles`) in `oidc`, and from userinfo groups or an API call in `proxy`.
- [x] `authInterceptor`: `Accept-Language` from the active language, sent to `apiBaseUrl` requests by a separate `languageInterceptor`. 401 triggers re-auth in both models, with a 30-second loop guard. `oidc` attaches the bearer token to `apiBaseUrl` requests only. `proxy` sets `withCredentials` and skips re-auth on the userinfo call.
- [ ] Optional: terms-of-service gate (`TermsService`, `termsGuard`, 403 `terms_not_accepted` handling in the interceptor, `/terms` acceptance page, public `/tos` view). Needs a matching API contract in `neillans-api`.
- [ ] Optional: public `/privacy` page outside the guarded layout, populated from deployment config.

## UI shell and shared components

- [x] Bootstrap 5.3 + Bootstrap Icons via SCSS, overrides in `src/styles/_materio-variables.scss` / `_materio-theme.scss`. Inter is self-hosted from `@fontsource-variable/inter`. Bootstrap JS is not global; `main.ts` imports the ESM dropdown plugin (about 11 kB gzipped with Popper).
- [x] `MainLayoutComponent`: collapsible sidebar from a nav config (`layout/navigation.ts`, entries filtered by `roles`), top bar, theme menu, profile dropdown with initials avatar, sign-out, footer with year. Versions in the footer come with versioning.
- [ ] Optional: Gravatar in the profile avatar (sends a hash of the email to a third party, so make it opt-in via deployment config).
- [x] Light/dark/system theme: `ThemeService` setting `data-bs-theme`, persisted in `localStorage` under `<app-name>.theme`, plus the inline script in `index.html` that applies it before first paint.
- [x] `ToastService` + `ToastContainerComponent`.
- [x] `ConfirmService` (promise-based) + `ConfirmDialogComponent` (Escape cancels, focus starts on Cancel).
- [x] `PageHeaderComponent`, `EmptyStateComponent`, `StatusBadgeComponent`, using signal `input()`.
- [x] `index.html`: title and description from `--title`, SVG favicon, apple-touch-icon, theme colour. `I18nService` sets `lang` at startup.
- [x] `--title` parameter (defaults to the project name in title case) and `AppTitleStrategy` (`<translated page> · <app title>`).

## Internationalisation

- [x] Transloco (`@jsverse/transloco`) with an HTTP loader reading `public/i18n/<lang>.json`, so one build serves every language. Language comes from the stored choice, then `DEFAULT_LANGUAGE`; `LANGUAGES` narrows the offer per deployment. A top-bar picker appears with more than one language; switching reloads.
- [x] Translated page titles: route `title` values are translation keys (`marker(...)`), and `AppTitleStrategy` renders `<translated> · <AppName>`.
- [x] `src/testing/transloco-testing.ts` helper for specs.
- [x] `scripts/check-i18n-keys.mjs`: fails on missing or unused keys. Wired into `npm run lint`.
- [ ] Optional: `scripts/check-uk-english.mjs` spelling check.
- [ ] Optional: `crowdin.yml` template.

## Runtime configuration

- [x] `DeploymentConfigService` loading `/deployment-config.json` at startup.
- [x] `docker/40-deployment-config.sh` installed into `/docker-entrypoint.d/` that writes that JSON from env vars, so one image serves every environment. Make the key list easy to extend.
- [x] Same-origin `apiBaseUrl: '/api'` with `proxy.conf.json` for `ng serve`. All settings, including OIDC authority/client and the proxy prefix, come from deployment config; `src/environments` was removed.
- [ ] Additional build configurations (`dev`, `production`). Runtime config covers what other projects used `fileReplacements` for, so only add these if OTel or similar needs build-time values.

## Versioning

- [ ] `scripts/set-version.mjs` stamping `src/version.ts` from `APP_VERSION`; committed fallback `0.0.0-dev`.
- [ ] `VersionService` showing frontend version and fetching backend `/api/version`.
- [ ] Add a `/version` endpoint to `neillans-api` to match.
- [ ] Dockerfile `VERSION` build arg feeding `set-version`.

## Observability

- [ ] Browser OpenTelemetry (`browser-telemetry.ts`): `WebTracerProvider`, OTLP/HTTP exporter, XHR and fetch instrumentation, ignores its own `/otlp/` posts. Initialised in `main.ts` before bootstrap; off by default in local `environment.ts`.
- [ ] Gateway/compose route for `/otlp/v1/traces` to an OTel collector in `docker/stacks/full-stack.compose.yml`.
- [ ] `docs/OBSERVABILITY.md` equivalent.

## Container and deployment

- [x] `nginx.conf`: SPA fallback, `index.html` no-cache, long-cache hashed assets, `/healthz`, gzip, `server_tokens off`. Also proxies `/api/` to `API_UPSTREAM` when set (503 otherwise).
- [ ] Dockerfile: `BUILD_ENV` arg selecting build configuration, pinned Node patch version.
- [x] `.dockerignore`.
- [x] `proxy` model: oauth2-proxy in the generated compose, with the SPA's nginx acting as the gateway for `/api/`. Verified with Podman and a headless browser for both models: sign-in, return path, roles, API token and audience/role checks (200 admin / 403 user), and sign-out. Sign-out ends the Keycloak session server-side via `OAUTH2_PROXY_BACKEND_LOGOUT_URL`. `ng serve` against the proxy stack also verified.
- [ ] `docker/stacks/full-stack.compose.yml` still runs the `oidc` SPA (built from raw content). Add a `proxy` variant, which needs a generated proxy build context. Add `/otlp` routing with the OTel work.
- [x] Keycloak realm: add a confidential `oauth2-proxy` client with the `roles` mapper and `api-host` audience; keep `angular-spa` (public, PKCE) for `oidc`.
- [ ] Optional: Helm chart (`deploy/helm/<app>`: deployment, service, ingress, values, values-prod).

## Tooling and quality

- [x] ESLint flat config (`eslint.config.mjs`) with `angular-eslint` (TS, template and accessibility rules) and `typescript-eslint`. `npm run lint` runs `ng lint` then `prettier --check`.
- [x] Prettier (`.prettierrc.json`, Angular HTML parser override). `npm run format` rewrites.
- [x] Husky pre-commit + `lint-staged`. `scripts/install-git-hooks.mjs` installs the hook only when the app is at or directly under the git root, so it never touches this repo's hooks.
- [x] `.editorconfig`.
- [ ] `.vscode/` (`extensions.json`, `launch.json`, `tasks.json`).
- [x] Specs for i18n setup. Guards, interceptors, both auth services, deployment config, i18n, title strategy, theme, toast, confirm (service and dialog) and the layout are covered.

## CI/CD (generated project)

- [ ] `.github/workflows/frontend-ci.yml`: `npm ci`, lint, test, production build, then build and push the image to GHCR.
- [ ] `.github/workflows/release.yml`: semantic version calculation, versioned image build.
- [ ] Optional: deploy workflow (SSH compose or Helm). Probably documented, not generated.
- [ ] `.github/dependabot.yml` (npm, docker, github-actions).

## This repo

- [x] `angular-validate` CI job and example validation run `npm ci`, lint, build and test.
- [x] `scripts/verify-templates.sh` lints, builds and tests the Angular output for both auth models.
- [x] `--auth` parameter.
- [ ] Add `dotnet new` parameters for the optional pieces (terms gate, OTel, Helm, i18n checks) in `template.json`.
- [ ] Update `templates/neillans-angular/content/README.md`, `docs/architecture.md` and `docs/templates/usage.md` alongside each change.
