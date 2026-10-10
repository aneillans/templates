import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { Translation, TranslocoTestingModule } from '@jsverse/transloco';
import enGB from '../../public/i18n/en-GB.json';

/**
 * Transloco for specs: the real `en-GB` translations, loaded synchronously, so specs assert on the
 * same English text users see. Pass `langs` to add or replace languages.
 */
export function provideTranslocoTesting(
  langs: Record<string, Translation> = {},
): EnvironmentProviders {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { 'en-GB': enGB, ...langs },
      translocoConfig: {
        availableLangs: ['en-GB', ...Object.keys(langs)],
        defaultLang: 'en-GB',
        reRenderOnLangChange: false,
      },
      preloadLangs: true,
    }),
  );
}
