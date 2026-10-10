import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService, AuthUser } from './auth.service';

/** Test double for the auth contract: records sign-in calls instead of redirecting. */
@Injectable()
export class FakeAuthService extends AuthService {
  readonly signInCalls: (string | undefined)[] = [];
  signOutCalls = 0;

  load(): Observable<void> {
    this.loaded.set(true);
    return of(undefined);
  }

  signIn(returnTo?: string): void {
    this.signInCalls.push(returnTo);
  }

  signOut(): void {
    this.signOutCalls++;
    this.user.set(null);
  }
}

export function testUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'u-1',
    name: 'demo-user',
    email: 'demo-user@example.com',
    roles: ['user'],
    ...overrides,
  };
}

/** Stand-in for `BROWSER_LOCATION`. */
export function fakeLocation(origin = 'http://localhost:4200') {
  return { origin, assign: vi.fn<(url: string | URL) => void>(), reload: vi.fn<() => void>() };
}
