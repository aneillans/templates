# Template Usage

## Install template packs locally

```bash
dotnet new install ./templates/neillans-api
dotnet new install ./templates/neillans-mvc
dotnet new install ./templates/neillans-angular
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
dotnet new install Neillans.Templates.Api::1.0.0
dotnet new install Neillans.Templates.Mvc::1.0.0
dotnet new install Neillans.Templates.Angular::1.0.0
```

## Smoke test

```bash
./scripts/verify-templates.sh
```

## Full demo examples

This repo also includes full generated examples that can be run directly:

- `examples/api-demo/content`
- `examples/mvc-demo/content`
- `examples/angular-demo/content/demo-angular`

See `examples/README.md` for run and validation commands.
