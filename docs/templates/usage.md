# Template Usage

## Install template packs locally

Each template's `.template.config` lives inside its `content/` folder, so install that folder (or the packed `.nupkg`).

```bash
dotnet new install ./templates/neillans-api/content
dotnet new install ./templates/neillans-mvc/content
dotnet new install ./templates/neillans-angular/content
```

## Generate projects

```bash
dotnet new neillans-api -n MyCompany.Api
dotnet new neillans-mvc -n MyCompany.Web
dotnet new neillans-angular -n mycompany-spa                # auth in the SPA (default)
dotnet new neillans-angular -n mycompany-spa --auth proxy   # auth offloaded to oauth2-proxy
dotnet new neillans-angular -n mycompany-spa --title "MyCompany Portal"
```

`--title` sets the display name used for the brand, page titles and footer. It defaults to the project name in title case (`mycompany-spa` becomes `Mycompany Spa`).

`--auth` is chosen at generation time. Switching later means regenerating, or copying the other model's `auth.providers.ts` and auth service from a freshly generated project. Feature code is unaffected either way.

## Update templates in a consumer machine

```bash
dotnet new update
dotnet new install Neillans.Templates.Api::1.1.0
dotnet new install Neillans.Templates.Mvc::1.1.0
dotnet new install Neillans.Templates.Angular::1.1.0
```

## Smoke test

```bash
./scripts/verify-templates.sh
```

The script packs every template, installs the packages into an isolated template hive, generates each template (including `neillans-api --useSwagger false` and `neillans-angular` with each `--auth` model) outside the repo, checks no packaging files or template directives leak into the output, then builds and tests it. Angular outputs are also linted (ESLint, translation keys and Prettier). CI runs it in the `template-smoke` job.

## Full demo examples

This repo also includes full generated examples that can be run directly:

- `examples/api-demo/content`
- `examples/mvc-demo/content`
- `examples/angular-demo/content/demo-angular`
- `examples/angular-proxy-demo/content/demo-angular-proxy`

See `examples/README.md` for run and validation commands.
