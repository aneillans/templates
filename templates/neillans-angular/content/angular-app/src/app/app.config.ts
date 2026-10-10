import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppTitleStrategy } from './app-title.strategy';
import { routes } from './app.routes';
import { authInterceptors, provideAppAuth } from './core/auth/auth.providers';
import { AuthService } from './core/auth/auth.service';
import { DeploymentConfigService } from './core/config/deployment-config.service';
import { I18nService } from './core/i18n/i18n.service';
import { languageInterceptor, provideAppI18n } from './core/i18n/i18n.providers';
import { ThemeService } from './core/theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideHttpClient(withInterceptors([languageInterceptor, ...authInterceptors])),
    provideAppAuth(),
    provideAppI18n(),
    // Runtime config, the session and the language, all before the first route renders so guards
    // can decide and pages render translated. None throws: a missing config falls back to defaults,
    // no session means signed out, and missing translations show their keys.
    provideAppInitializer(() => firstValueFrom(inject(DeploymentConfigService).load())),
    provideAppInitializer(() => firstValueFrom(inject(AuthService).load())),
    provideAppInitializer(() => inject(I18nService).load()),
    // Starts following the OS colour scheme; index.html already applied the stored choice.
    provideAppInitializer(() => void inject(ThemeService)),
  ],
};
