import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { AuthService, AuthUser, isSafeReturnPath, readSession, writeSession } from './auth.service';
import { extractRoles } from './roles';

const RETURN_TO_KEY = 'auth.returnTo';

/**
 * `--auth oidc`: the SPA runs the authorisation code + PKCE flow itself via
 * angular-auth-oidc-client and attaches the access token to API requests (see auth.providers.ts).
 * Roles come from the ID token's flat `roles` claim.
 */
@Injectable()
export class OidcAuthService extends AuthService {
  private readonly oidc = inject(OidcSecurityService);

  constructor() {
    super();
    // Clear the user when the library drops the session (failed silent renew, logoff elsewhere).
    this.oidc.isAuthenticated$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((result) => {
      if (!result.isAuthenticated) this.user.set(null);
    });
  }

  load(): Observable<void> {
    // checkAuth also completes the code flow when the URL carries an authorisation response.
    return this.oidc.checkAuth().pipe(
      switchMap((response) =>
        response.isAuthenticated
          ? this.oidc.getPayloadFromIdToken().pipe(map((claims) => toUser(claims ?? {})))
          : of(null),
      ),
      catchError(() => of(null)),
      tap((user) => {
        this.user.set(user);
        if (user) this.restoreReturnPath();
      }),
      map(() => undefined),
      finalize(() => this.loaded.set(true)),
    );
  }

  signIn(returnTo = '/'): void {
    writeSession(RETURN_TO_KEY, returnTo);
    this.oidc.authorize();
  }

  signOut(): void {
    this.user.set(null);
    // Redirects to the provider's end-session endpoint, then back to postLogoutRedirectUri.
    this.oidc.logoff().subscribe();
  }

  /**
   * The provider returns to the app root; put the originally requested path back before the
   * router reads the URL for its first navigation.
   */
  private restoreReturnPath(): void {
    const returnTo = readSession(RETURN_TO_KEY);
    writeSession(RETURN_TO_KEY, null);
    if (isSafeReturnPath(returnTo)) {
      this.document.defaultView?.history.replaceState(null, '', returnTo);
    }
  }
}

function toUser(claims: Record<string, unknown>): AuthUser {
  const text = (key: string) => (typeof claims[key] === 'string' ? (claims[key] as string) : '');
  return {
    id: text('sub'),
    name: text('preferred_username') || text('name') || text('email'),
    email: text('email'),
    roles: extractRoles(claims),
  };
}
