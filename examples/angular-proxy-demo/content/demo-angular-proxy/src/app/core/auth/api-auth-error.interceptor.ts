import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { DeploymentConfigService } from '../config/deployment-config.service';
import { AuthService } from './auth.service';

/**
 * An API 401 means the session has expired: sign in again and come back. Only API requests are
 * handled, so the auth model's own endpoints (e.g. the proxy's userinfo) can 401 without
 * triggering a redirect.
 */
export const apiAuthErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const apiBaseUrl = inject(DeploymentConfigService).config().apiBaseUrl;

  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        req.url.startsWith(apiBaseUrl)
      ) {
        auth.reauthenticate();
      }
      return throwError(() => error);
    }),
  );
};
