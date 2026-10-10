import { EnvironmentProviders, Provider, inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { DeploymentConfigService } from '../config/deployment-config.service';
import { apiAuthErrorInterceptor } from './api-auth-error.interceptor';
import { AuthService } from './auth.service';
import { ProxyAuthService } from './proxy-auth.service';

/**
 * Auth model: `proxy`. An edge proxy (oauth2-proxy by default) owns the session; the browser holds
 * only its cookie and never sees a token.
 */
export function provideAppAuth(): (Provider | EnvironmentProviders)[] {
  return [{ provide: AuthService, useClass: ProxyAuthService }];
}

/** Sends the proxy's session cookie with API and proxy requests, even when they are cross-origin. */
const proxyCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(DeploymentConfigService).config();
  const ours =
    req.url.startsWith(config.apiBaseUrl) || req.url.startsWith(config.authProxyBasePath);
  return next(ours ? req.clone({ withCredentials: true }) : req);
};

export const authInterceptors: HttpInterceptorFn[] = [
  proxyCredentialsInterceptor,
  apiAuthErrorInterceptor,
];
