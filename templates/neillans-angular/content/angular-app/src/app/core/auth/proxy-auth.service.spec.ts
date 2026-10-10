import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BROWSER_LOCATION } from './auth.service';
import { ProxyAuthService } from './proxy-auth.service';
import { fakeLocation } from './testing';

describe('ProxyAuthService', () => {
  let service: ProxyAuthService;
  let httpMock: HttpTestingController;
  let location: ReturnType<typeof fakeLocation>;

  beforeEach(() => {
    location = fakeLocation();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProxyAuthService,
        { provide: BROWSER_LOCATION, useValue: location },
      ],
    });
    service = TestBed.inject(ProxyAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  async function load(flush: (mock: HttpTestingController) => void) {
    const done = firstValueFrom(service.load());
    httpMock.expectOne('/deployment-config.json').flush({});
    await Promise.resolve();
    flush(httpMock);
    await done;
  }

  it('maps the proxy userinfo to the user, with groups as roles', async () => {
    await load((mock) =>
      mock.expectOne('/oauth2/userinfo').flush({
        user: 'f3a1',
        email: 'demo-admin@example.com',
        preferredUsername: 'demo-admin',
        groups: ['admin', 'user'],
      }),
    );

    expect(service.user()).toEqual({
      id: 'f3a1',
      name: 'demo-admin',
      email: 'demo-admin@example.com',
      roles: ['admin', 'user'],
    });
    expect(service.isAdmin()).toBe(true);
    expect(service.loaded()).toBe(true);
  });

  it('treats a 401 from userinfo as signed out', async () => {
    await load((mock) =>
      mock.expectOne('/oauth2/userinfo').flush(null, { status: 401, statusText: 'Unauthorized' }),
    );

    expect(service.user()).toBeNull();
    expect(service.loaded()).toBe(true);
  });

  it('signs in through the proxy with an absolute return URL', () => {
    service.signIn('/admin?x=1');
    expect(location.assign).toHaveBeenCalledWith(
      `/oauth2/start?rd=${encodeURIComponent('http://localhost:4200/admin?x=1')}`,
    );
  });

  it('signs out through the proxy back to the app root by default', () => {
    service.signOut();
    expect(location.assign).toHaveBeenCalledWith(
      `/oauth2/sign_out?rd=${encodeURIComponent('http://localhost:4200/')}`,
    );
  });
});
