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
dotnet new neillans-angular -n mycompany-spa
```

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

The script packs every template, installs the packages into an isolated template hive, generates each template (including `neillans-api --useSwagger false`) outside the repo, checks no packaging files leak into the output, then builds and tests it. CI runs it in the `template-smoke` job.

## Full demo examples

This repo also includes full generated examples that can be run directly:

- `examples/api-demo/content`
- `examples/mvc-demo/content`
- `examples/angular-demo/content/demo-angular`

See `examples/README.md` for run and validation commands.
