# Materio Free Template Integration

To stay compliant with upstream licensing, this repository includes integration hooks but not bundled Materio assets.

## Steps

1. Download or clone the free Materio template from:
   - https://github.com/themeselection/materio-bootstrap-html-aspnet-core-mvc-admin-template-free
2. Copy the UI assets into your generated MVC app:
   - `wwwroot/assets`
   - `_Layout.cshtml` updates
   - shared partials for nav/header/footer
3. Keep all Materio-specific overrides in:
   - `src/MvcHost/Theming/MaterioOverrides`

## Update strategy

- Keep generated app customizations out of vendor files.
- Apply project-specific theming in local partials and scoped CSS.
- Re-run your import script when Materio updates and only diff override files.

## Suggested script entrypoint

Use `scripts/import-materio.sh` in generated projects as your repeatable import command.
