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
    provideHttpClient(withInterceptors(authInterceptors)),
    provideAppAuth(),
    // Runtime config, then the session, both before the first route renders so guards can decide.
    // Neither throws: a missing config falls back to defaults and no session means signed out.
    provideAppInitializer(() => firstValueFrom(inject(DeploymentConfigService).load())),
    provideAppInitializer(() => firstValueFrom(inject(AuthService).load())),
    // Starts following the OS colour scheme; index.html already applied the stored choice.
    provideAppInitializer(() => void inject(ThemeService)),
  ],
};
