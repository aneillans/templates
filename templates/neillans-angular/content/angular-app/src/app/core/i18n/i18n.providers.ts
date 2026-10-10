import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import {
  EnvironmentProviders,
  Injectable,
  LOCALE_ID,
  Provider,
  inject,
  isDevMode,
} from '@angular/core';
import { Translation, TranslocoLoader, provideTransloco } from '@jsverse/transloco';
import { DeploymentConfigService } from '../config/deployment-config.service';
import { I18nService } from './i18n.service';
import { LANGUAGES } from './languages';

/** Reads `public/i18n/<lang>.json` at runtime, so one build serves every language. */
@Injectable({ providedIn: 'root' })
export class TranslationHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/i18n/${lang}.json`);
  }
}

/**
 * Transloco and `LOCALE_ID`. The first entry in LANGUAGES is the source language: keys missing
 * from another language fall back to it. I18nService picks the active language at startup.
 */
export function provideAppI18n(): (Provider | EnvironmentProviders)[] {
  const source = LANGUAGES[0].id;
  return [
    provideTransloco({
      config: {
        availableLangs: LANGUAGES.map((l) => l.id),
        defaultLang: source,
        fallbackLang: source,
        missingHandler: { useFallbackTranslation: true },
        // Changing language reloads the page (see I18nService), so templates never re-render for it.
        reRenderOnLangChange: false,
        prodMode: !isDevMode(),
      },
      loader: TranslationHttpLoader,
    }),
    // Read once, after the app initializers, so it sees the language I18nService picked.
    { provide: LOCALE_ID, useFactory: () => inject(I18nService).locale() },
  ];
}

/** Tells the API which language to answer in (validation messages, emails). API requests only. */
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = inject(DeploymentConfigService).config().apiBaseUrl;
  if (!req.url.startsWith(apiBaseUrl) || req.headers.has('Accept-Language')) {
    return next(req);
  }
  const language = inject(I18nService).language().id;
  return next(req.clone({ setHeaders: { 'Accept-Language': language } }));
};
