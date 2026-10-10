import { EnvironmentProviders, Provider, inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import {
  OpenIdConfiguration,
  StsConfigHttpLoader,
  StsConfigLoader,
  authInterceptor,
  provideAuth,
} from 'angular-auth-oidc-client';
import { map } from 'rxjs';
import { DeploymentConfigService } from '../config/deployment-config.service';
import { DeploymentConfig } from '../config/deployment-config';
import { apiAuthErrorInterceptor } from './api-auth-error.interceptor';
import { AuthService } from './auth.service';
import { OidcAuthService } from './oidc-auth.service';

/**
 * Auth model: `oidc`. The SPA signs in with authorisation code + PKCE and attaches the access token
 * to requests under `apiBaseUrl`. Settings come from the deployment config, so one image works
 * against any issuer.
 */
export function provideAppAuth(): (Provider | EnvironmentProviders)[] {
  return [
    provideAuth({
      loader: {
        provide: StsConfigLoader,
        useFactory: () => {
          const deployment = inject(DeploymentConfigService);
          return new StsConfigHttpLoader(deployment.load().pipe(map(toOidcConfig)));
        },
      },
    }),
    { provide: AuthService, useClass: OidcAuthService },
  ];
}

/** Order matters: the token is attached before the 401 handler sees the response. */
export const authInterceptors: HttpInterceptorFn[] = [authInterceptor(), apiAuthErrorInterceptor];

function toOidcConfig(config: DeploymentConfig): OpenIdConfiguration {
  const origin = window.location.origin;
  return {
    authority: config.oidcAuthority,
    clientId: config.oidcClientId,
    scope: config.oidcScope,
    responseType: 'code',
    redirectUrl: origin,
    postLogoutRedirectUri: origin,
    silentRenew: true,
    useRefreshToken: true,
    secureRoutes: [config.apiBaseUrl],
    // Stop the library navigating to postLoginRoute after the callback; OidcAuthService restores
    // the originally requested path instead.
    triggerAuthorizationResultEvent: true,
  };
}
