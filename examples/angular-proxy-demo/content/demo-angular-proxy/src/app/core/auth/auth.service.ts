import { DOCUMENT } from '@angular/common';
import { InjectionToken, Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ROLES } from './roles';

/** The signed-in user, normalised across auth models. */
export interface AuthUser {
  /** Stable subject identifier from the identity provider. */
  id: string;
  /** Best available display name (preferred username, then name, then email). */
  name: string;
  email: string;
  roles: string[];
}

/**
 * Browser navigation used for sign-in/out redirects and reloads. A token so tests can swap it for
 * a stub instead of navigating jsdom.
 */
export const BROWSER_LOCATION = new InjectionToken<Pick<Location, 'assign' | 'origin' | 'reload'>>(
  'BROWSER_LOCATION',
  { factory: () => inject(DOCUMENT).defaultView!.location },
);

const REAUTH_STAMP_KEY = 'auth.reauthAt';
/** A 401 within this window of the last re-auth redirect is treated as a loop, not an expiry. */
const REAUTH_LOOP_WINDOW_MS = 30_000;

/**
 * App-facing auth contract. Guards, interceptors and features depend only on this class, so the
 * auth model (`oidc` in the browser, or `proxy` behind something like oauth2-proxy) can change
 * without touching them. Each model registers its implementation in `auth.providers.ts`.
 */
@Injectable()
export abstract class AuthService {
  protected readonly location = inject(BROWSER_LOCATION);
  protected readonly document = inject(DOCUMENT);

  readonly user = signal<AuthUser | null>(null);
  /** True once the initial session check has finished, whatever its outcome. */
  readonly loaded = signal(false);

  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly roles = computed(() => this.user()?.roles ?? []);
  readonly isAdmin = computed(() => this.roles().includes(ROLES.admin));
  readonly displayName = computed(() => this.user()?.name ?? '');
  readonly email = computed(() => this.user()?.email ?? '');

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  /** Resolves the current session. Runs once at startup; must never error. */
  abstract load(): Observable<void>;

  /** Starts sign-in, returning to `returnTo` (an app path) afterwards. */
  abstract signIn(returnTo?: string): void;

  abstract signOut(): void;

  /**
   * Called when the API answers 401: the session has expired, so sign in again. If that already
   * happened moments ago the API is rejecting fresh tokens (wrong audience, clock skew), and
   * redirecting again would loop, so it reports `false` and leaves the error to the caller.
   */
  reauthenticate(): boolean {
    const now = Date.now();
    const last = Number(readSession(REAUTH_STAMP_KEY) ?? 0);
    if (now - last < REAUTH_LOOP_WINDOW_MS) {
      return false;
    }
    writeSession(REAUTH_STAMP_KEY, String(now));
    this.signIn(currentPath(this.document));
    return true;
  }
}

/** Path, query and fragment of the current page. */
export function currentPath(document: Document): string {
  const location = document.defaultView?.location;
  return location ? `${location.pathname}${location.search}${location.hash}` : '/';
}

/** Only same-app paths are accepted as return targets, so a crafted value can't redirect off-site. */
export function isSafeReturnPath(path: string | null | undefined): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');
}

export function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string | null): void {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode): the value just isn't kept.
  }
}
