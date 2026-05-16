# Template Usage

## Install template packs locally

```bash
dotnet new install ./templates/aneillans-api
dotnet new install ./templates/aneillans-mvc
dotnet new install ./templates/aneillans-angular
```

## Generate projects

```bash
dotnet new aneillans-api -n MyCompany.Api
dotnet new aneillans-mvc -n MyCompany.Web
dotnet new aneillans-angular -n mycompany-spa
```

## Update templates in a consumer machine

```bash
dotnet new update
dotnet new install Aneillans.Templates.Api::1.0.0
dotnet new install Aneillans.Templates.Mvc::1.0.0
dotnet new install Aneillans.Templates.Angular::1.0.0
```

## Smoke test

```bash
./scripts/verify-templates.sh
```
