import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FactoryProvider, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BROWSER_LOCATION } from '../auth/auth.service';
import { fakeLocation } from '../auth/testing';
import { I18nService } from './i18n.service';
import { TranslationHttpLoader, languageInterceptor, provideAppI18n } from './i18n.providers';

describe('provideAppI18n', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([languageInterceptor])),
        provideHttpClientTesting(),
        provideAppI18n(),
        { provide: BROWSER_LOCATION, useValue: fakeLocation() },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads translations from public/i18n', async () => {
    const translation = firstValueFrom(TestBed.inject(TranslationHttpLoader).getTranslation('la'));
    httpMock.expectOne('/i18n/la.json').flush({ hello: 'salve' });
    await expect(translation).resolves.toEqual({ hello: 'salve' });
  });

  it('sets LOCALE_ID from the language picked at startup', async () => {
    const loading = TestBed.inject(I18nService).load();
    httpMock.expectOne('/deployment-config.json').flush({});
    await new Promise((resolve) => setTimeout(resolve));
    httpMock.expectOne('/i18n/en-GB.json').flush({});
    await loading;
    // TestBed resolves LOCALE_ID when it creates the module, before load(); the app reads it after
    // the initializers. So run the factory itself.
    const locale = provideAppI18n().find(
      (provider) => (provider as FactoryProvider).provide === LOCALE_ID,
    ) as FactoryProvider;
    expect(TestBed.runInInjectionContext(() => locale.useFactory())).toBe('en-GB');
  });

  describe('languageInterceptor', () => {
    function send(url: string, headers: Record<string, string> = {}) {
      TestBed.inject(HttpClient).get(url, { headers }).subscribe();
      const req = httpMock.expectOne(url);
      req.flush({});
      return req.request.headers.get('Accept-Language');
    }

    it('sends the active language to the API', () => {
      expect(send('/api/things')).toBe('en-GB');
    });

    it('leaves other requests alone', () => {
      expect(send('/oauth2/userinfo')).toBeNull();
    });

    it('keeps an explicit Accept-Language', () => {
      expect(send('/api/things', { 'Accept-Language': 'fr' })).toBe('fr');
    });
  });
});
