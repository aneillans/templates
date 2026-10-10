import { TestBed } from '@angular/core/testing';
import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { BROWSER_LOCATION } from './auth.service';
import { OidcAuthService } from './oidc-auth.service';
import { fakeLocation } from './testing';

describe('OidcAuthService', () => {
  const claims = {
    sub: 'f3a1',
    preferred_username: 'demo-admin',
    email: 'demo-admin@example.com',
    roles: ['admin', 'user'],
  };

  function setup(response: Partial<LoginResponse>) {
    const oidc = {
      isAuthenticated$: new BehaviorSubject({
        isAuthenticated: !!response.isAuthenticated,
        allConfigsAuthenticated: [],
      }),
      checkAuth: vi.fn(() => of(response as LoginResponse)),
      getPayloadFromIdToken: vi.fn(() => of(claims)),
      authorize: vi.fn(),
      logoff: vi.fn(() => of(null)),
    };
    TestBed.configureTestingModule({
      providers: [
        OidcAuthService,
        { provide: OidcSecurityService, useValue: oidc },
        { provide: BROWSER_LOCATION, useValue: fakeLocation() },
      ],
    });
    return { service: TestBed.inject(OidcAuthService), oidc };
  }

  beforeEach(() => sessionStorage.clear());

  it('builds the user from the ID token claims', async () => {
    const { service } = setup({ isAuthenticated: true });
    await firstValueFrom(service.load());

    expect(service.user()).toEqual({
      id: 'f3a1',
      name: 'demo-admin',
      email: 'demo-admin@example.com',
      roles: ['admin', 'user'],
    });
    expect(service.loaded()).toBe(true);
  });

  it('is signed out when there is no session', async () => {
    const { service, oidc } = setup({ isAuthenticated: false });
    await firstValueFrom(service.load());

    expect(service.user()).toBeNull();
    expect(oidc.getPayloadFromIdToken).not.toHaveBeenCalled();
    expect(service.loaded()).toBe(true);
  });

  it('restores the requested path after the sign-in round trip', async () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    const first = setup({ isAuthenticated: false });
    first.service.signIn('/admin?tab=2');
    expect(first.oidc.authorize).toHaveBeenCalled();

    TestBed.resetTestingModule();
    const { service } = setup({ isAuthenticated: true });
    await firstValueFrom(service.load());

    expect(replaceState).toHaveBeenCalledWith(null, '', '/admin?tab=2');
    replaceState.mockRestore();
  });

  it('ignores an off-site return path', async () => {
    sessionStorage.setItem('auth.returnTo', '//evil.example');
    const replaceState = vi.spyOn(window.history, 'replaceState');
    const { service } = setup({ isAuthenticated: true });
    await firstValueFrom(service.load());

    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });

  it('clears the user and logs off', () => {
    const { service, oidc } = setup({ isAuthenticated: true });
    service.signOut();
    expect(oidc.logoff).toHaveBeenCalled();
    expect(service.user()).toBeNull();
  });
});
