# Materio Free Template Integration

To stay compliant with upstream licensing, this repository includes integration hooks but not bundled Materio assets.

## Steps

1. Download or clone the free Materio template from:
   - https://github.com/themeselection/materio-bootstrap-html-aspnet-core-mvc-admin-template-free
2. Run the generated import script from your MVC project root.
   - The script can download Materio for you (default behavior)
   - Or it can import from a local clone/archive
   - It places assets in `wwwroot/assets` and imports shared view partials into `Views/Shared`
3. Keep all Materio-specific overrides in:
   - `src/MvcHost/Theming/MaterioOverrides`

## Update strategy

- Keep generated app customizations out of vendor files.
- Apply project-specific theming in local partials and scoped CSS.
- Re-run your import script when Materio updates and only diff override files.

## Suggested script entrypoint

The script exists in generated MVC projects at `scripts/import-materio.sh`.

Run it from the generated MVC project root:

```bash
./scripts/import-materio.sh
```

Import from a local clone instead of downloading:

```bash
./scripts/import-materio.sh --source <path-to-materio-repo>
```

If the file is not executable in your environment, run:

```bash
bash ./scripts/import-materio.sh
```
