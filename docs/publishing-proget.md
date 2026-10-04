# ProGet Publishing

## Required settings

- `PROGET_URL` (repository variable): v3 feed endpoint.
- `PROGET_API_KEY` (repository secret): API key/token for package push.

## Manual publish

```bash
dotnet pack src/building-blocks/Neillans.TemplateKit.Auth/Neillans.TemplateKit.Auth.csproj -c Release -o artifacts
dotnet pack src/building-blocks/Neillans.TemplateKit.Data/Neillans.TemplateKit.Data.csproj -c Release -o artifacts

dotnet pack templates/neillans-api/neillans-api.TemplatePack.csproj -c Release -o artifacts
dotnet pack templates/neillans-mvc/neillans-mvc.TemplatePack.csproj -c Release -o artifacts
dotnet pack templates/neillans-angular/neillans-angular.TemplatePack.csproj -c Release -o artifacts

dotnet nuget push "artifacts/*.nupkg" --source "$PROGET_URL" --api-key "$PROGET_API_KEY" --skip-duplicate
```

## Versioning recommendation

- Tag releases as `vX.Y.Z`.
- Keep template pack and building-block versions aligned.
- Bump `<Version>` in every pack `.csproj` before publishing. The push uses `--skip-duplicate`, so an unchanged version is skipped without failing the job.
- Publish from CI using `publish.yml`.
