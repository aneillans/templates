import { DOCUMENT, registerLocaleData } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { STORAGE_PREFIX } from '../../app-info';
import { BROWSER_LOCATION } from '../auth/auth.service';
import { DeploymentConfigService } from '../config/deployment-config.service';
import { LANGUAGES, Language } from './languages';

export const LANGUAGE_STORAGE_KEY = `${STORAGE_PREFIX}.language`;

/** Angular's built-in locale, used until (or if) the active language's locale data loads. */
const BUILT_IN_LOCALE = 'en-US';

/**
 * The active language: translations (Transloco), Angular's locale for dates and numbers, and
 * `<html lang>`. Chosen once at startup: the user's stored choice, else the deployment default.
 * Changing it reloads the page, because `LOCALE_ID` is fixed when the app bootstraps.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(BROWSER_LOCATION);
  private readonly transloco = inject(TranslocoService);
  private readonly deployment = inject(DeploymentConfigService);

  private readonly available = signal<Language[]>(LANGUAGES);
  private readonly active = signal<Language>(LANGUAGES[0]);
  private readonly localeId = signal(BUILT_IN_LOCALE);

  /** Languages offered in this deployment. */
  readonly languages = this.available.asReadonly();
  readonly language = this.active.asReadonly();
  /** Value for `LOCALE_ID`. */
  readonly locale = this.localeId.asReadonly();

  /**
   * Picks the language and loads its translations and locale data. Never throws: missing
   * translations show their keys and missing locale data leaves Angular's `en-US` formats.
   */
  async load(): Promise<void> {
    const config = await firstValueFrom(this.deployment.load());
    const available = offered(config.languages);
    const language =
      available.find((l) => l.id === this.stored()) ??
      available.find((l) => l.id === config.defaultLanguage) ??
      available[0];

    this.available.set(available);
    this.active.set(language);
    this.transloco.setAvailableLangs(available.map((l) => l.id));
    this.document.documentElement.lang = language.id;

    await Promise.all([
      language
        .localeData()
        .then((data) => {
          registerLocaleData(data.default, language.id);
          this.localeId.set(language.id);
        })
        .catch((error: unknown) => console.error(`Locale data for ${language.id}`, error)),
      firstValueFrom(this.transloco.load(language.id)).catch((error: unknown) =>
        console.error(`Translations for ${language.id}`, error),
      ),
    ]);
    this.transloco.setActiveLang(language.id);
  }

  /** Stores the choice and reloads into it. */
  setLanguage(id: string): void {
    if (id === this.active().id || !this.available().some((l) => l.id === id)) {
      return;
    }
    try {
      this.document.defaultView?.localStorage.setItem(LANGUAGE_STORAGE_KEY, id);
    } catch {
      return; // Storage blocked: a reload would come back in the same language.
    }
    this.location.reload();
  }

  private stored(): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }
}

/** Shipped languages narrowed to the configured comma-separated list; all of them if none match. */
function offered(list: string): Language[] {
  const ids = list
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const matched = LANGUAGES.filter((l) => ids.includes(l.id));
  return matched.length > 0 ? matched : LANGUAGES;
}
