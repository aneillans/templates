import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { adminGuard, authGuard, roleGuard } from './auth.guards';
import { AuthService, BROWSER_LOCATION } from './auth.service';
import { FakeAuthService, fakeLocation, testUser } from './testing';

describe('auth guards', () => {
  let auth: FakeAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: FakeAuthService },
        { provide: BROWSER_LOCATION, useValue: fakeLocation() },
      ],
    });
    auth = TestBed.inject(AuthService) as FakeAuthService;
  });

  const run = (guard: typeof authGuard, url = '/') =>
    TestBed.runInInjectionContext(() => guard({} as never, { url } as never));

  it('authGuard lets a signed-in user through', () => {
    auth.user.set(testUser());
    expect(run(authGuard)).toBe(true);
    expect(auth.signInCalls).toEqual([]);
  });

  it('authGuard starts sign-in for the requested URL when signed out', () => {
    expect(run(authGuard, '/admin?tab=2')).toBe(false);
    expect(auth.signInCalls).toEqual(['/admin?tab=2']);
  });

  it('adminGuard allows admins', () => {
    auth.user.set(testUser({ roles: ['admin'] }));
    expect(run(adminGuard)).toBe(true);
  });

  it('adminGuard redirects other users to the landing page', () => {
    auth.user.set(testUser({ roles: ['user'] }));
    const result = run(adminGuard);
    expect(result instanceof UrlTree).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });

  it('roleGuard accepts any of the listed roles', () => {
    auth.user.set(testUser({ roles: ['editor'] }));
    expect(run(roleGuard('admin', 'editor'))).toBe(true);
  });
});
