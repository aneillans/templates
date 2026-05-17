# Full Demo Examples

This folder contains full generated examples from the local templates.

- `api-demo/content`: generated from `dotnet new neillans-api -n DemoApi`
- `mvc-demo/content`: generated from `dotnet new neillans-mvc -n DemoMvc`
- `angular-demo/content/demo-angular`: generated from `dotnet new neillans-angular -n demo-angular`

These demos are intended to show end-to-end template usage and provide a concrete validation surface.

## Run the demos

### API demo

```bash
dotnet restore examples/api-demo/content/DemoApi.sln
dotnet run --project examples/api-demo/content/src/DemoApi/DemoApi.csproj
```

### MVC demo

```bash
dotnet restore examples/mvc-demo/content/DemoMvc.sln
dotnet run --project examples/mvc-demo/content/src/DemoMvc/DemoMvc.csproj
```

### Angular demo

```bash
npm --prefix examples/angular-demo/content/demo-angular install
npm --prefix examples/angular-demo/content/demo-angular start
```

## Validate all demos

### API

```bash
dotnet restore examples/api-demo/content/DemoApi.sln
dotnet build examples/api-demo/content/DemoApi.sln -c Release --no-restore
dotnet test examples/api-demo/content/tests/DemoApi.Tests/DemoApi.Tests.csproj -c Release --no-build
```

### MVC

```bash
dotnet restore examples/mvc-demo/content/DemoMvc.sln
dotnet build examples/mvc-demo/content/DemoMvc.sln -c Release --no-restore
dotnet test examples/mvc-demo/content/tests/DemoMvc.Tests/DemoMvc.Tests.csproj -c Release --no-build
```

### Angular

```bash
npm --prefix examples/angular-demo/content/demo-angular install
npm --prefix examples/angular-demo/content/demo-angular run build
npm --prefix examples/angular-demo/content/demo-angular test
```

## Notes

- `examples/Directory.Packages.props` disables central package management for demos so they behave like standalone consumer projects.
- `examples/Directory.Build.props` disables warnings-as-errors for demos so repo-level analysis strictness does not mask runtime template behavior.