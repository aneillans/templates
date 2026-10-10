/** A language the app ships translations for. */
export interface Language {
  /**
   * BCP 47 tag. Names the translation file (`public/i18n/<id>.json`) and is used as `LOCALE_ID`,
   * `<html lang>` and the API's `Accept-Language`, so it must match an Angular locale.
   */
  id: string;
  /** Shown in the language picker, in the language itself. */
  label: string;
  /** Angular's date, number and currency formats for the locale. Loaded only when selected. */
  localeData: () => Promise<{ default: unknown[] }>;
}

/**
 * Languages the app ships. To add one: add `public/i18n/<id>.json` with the same keys as the
 * existing files, then add an entry here. Deployment config can narrow the list per environment.
 */
export const LANGUAGES: Language[] = [
  {
    id: 'en-GB',
    label: 'English',
    localeData: () => import('@angular/common/locales/en-GB'),
  },
];

/**
 * Identity function marking a string as a translation key, for keys defined outside templates
 * (route titles, navigation) and translated later. `scripts/check-i18n-keys.mjs` finds keys by
 * looking for `marker('...')`, `translate('...')` and `'...' | transloco`, so keys must be literals.
 */
export function marker(key: string): string {
  return key;
}
