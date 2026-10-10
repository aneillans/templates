import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { DeploymentConfigService } from '../config/deployment-config.service';
import { AuthService, AuthUser } from './auth.service';

/** oauth2-proxy's `/oauth2/userinfo` response. */
interface ProxyUserInfo {
  user?: string;
  email?: string;
  preferredUsername?: string;
  /** Populated from the claim named by `--oidc-groups-claim`; the stack maps it to `roles`. */
  groups?: string[];
}

/**
 * `--auth proxy`: authentication is offloaded to an edge proxy (oauth2-proxy by default). The SPA
 * is served through the proxy, so the browser only holds the proxy's session cookie and never sees
 * a token; the proxy adds the bearer token to API requests on the way through.
 *
 * Other proxies work if they expose the same endpoints under `authProxyBasePath`:
 * `userinfo`, `start?rd=` and `sign_out?rd=`.
 */
@Injectable()
export class ProxyAuthService extends AuthService {
  private readonly http = inject(HttpClient);
  private readonly deployment = inject(DeploymentConfigService);

  private get basePath(): string {
    return this.deployment.config().authProxyBasePath;
  }

  load(): Observable<void> {
    return this.deployment.load().pipe(
      switchMap(() => this.http.get<ProxyUserInfo>(`${this.basePath}/userinfo`)),
      map(toUser),
      catchError(() => of(null)),
      tap((user) => this.user.set(user)),
      map(() => undefined),
      finalize(() => this.loaded.set(true)),
    );
  }

  signIn(returnTo = '/'): void {
    // Absolute so `ng serve` (a different port from the proxy) gets the browser back; the proxy
    // only accepts it when the host is in its whitelist (--whitelist-domain).
    const rd = new URL(returnTo, this.location.origin).toString();
    this.location.assign(`${this.basePath}/start?rd=${encodeURIComponent(rd)}`);
  }

  signOut(): void {
    this.user.set(null);
    const rd = this.deployment.config().authProxySignOutRedirect || `${this.location.origin}/`;
    this.location.assign(`${this.basePath}/sign_out?rd=${encodeURIComponent(rd)}`);
  }
}

function toUser(info: ProxyUserInfo | null): AuthUser | null {
  if (!info || !(info.user || info.email)) {
    return null;
  }
  return {
    id: info.user ?? info.email ?? '',
    name: info.preferredUsername || info.user || info.email || '',
    email: info.email ?? '',
    roles: Array.isArray(info.groups) ? info.groups : [],
  };
}
