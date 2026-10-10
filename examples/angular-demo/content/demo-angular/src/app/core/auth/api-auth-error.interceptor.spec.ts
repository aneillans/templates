import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiAuthErrorInterceptor } from './api-auth-error.interceptor';
import { AuthService, BROWSER_LOCATION } from './auth.service';
import { FakeAuthService, fakeLocation } from './testing';

describe('apiAuthErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: FakeAuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiAuthErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useClass: FakeAuthService },
        { provide: BROWSER_LOCATION, useValue: fakeLocation() },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService) as FakeAuthService;
  });

  afterEach(() => httpMock.verify());

  function respond(url: string, status: number) {
    http.get(url).subscribe({ error: () => undefined });
    httpMock.expectOne(url).flush(null, { status, statusText: 'x' });
  }

  it('signs in again when the API answers 401', () => {
    respond('/api/things', 401);
    expect(auth.signInCalls.length).toBe(1);
  });

  it('does not redirect twice in a row (token rejected, not expired)', () => {
    respond('/api/things', 401);
    respond('/api/things', 401);
    expect(auth.signInCalls.length).toBe(1);
  });

  it('ignores 401s from outside the API', () => {
    respond('/oauth2/userinfo', 401);
    expect(auth.signInCalls).toEqual([]);
  });

  it('ignores other API errors', () => {
    respond('/api/things', 403);
    expect(auth.signInCalls).toEqual([]);
  });
});
