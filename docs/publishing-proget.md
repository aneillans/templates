# ProGet Publishing

## Required secrets

- `PROGET_NUGET_SOURCE`: v3 feed endpoint
- `PROGET_API_KEY`: API key/token for package push

## Manual publish

```bash
dotnet pack src/building-blocks/Aneillans.TemplateKit.Auth/Aneillans.TemplateKit.Auth.csproj -c Release -o artifacts
dotnet pack src/building-blocks/Aneillans.TemplateKit.Data/Aneillans.TemplateKit.Data.csproj -c Release -o artifacts

dotnet pack templates/aneillans-api/aneillans-api.TemplatePack.csproj -c Release -o artifacts
dotnet pack templates/aneillans-mvc/aneillans-mvc.TemplatePack.csproj -c Release -o artifacts
dotnet pack templates/aneillans-angular/aneillans-angular.TemplatePack.csproj -c Release -o artifacts

dotnet nuget push "artifacts/*.nupkg" --source "$PROGET_NUGET_SOURCE" --api-key "$PROGET_API_KEY" --skip-duplicate
```

## Versioning recommendation

- Tag releases as `vX.Y.Z`.
- Keep template pack and building-block versions aligned.
- Publish from CI using `publish.yml`.
