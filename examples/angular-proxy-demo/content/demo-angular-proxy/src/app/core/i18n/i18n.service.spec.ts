import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';
import { BROWSER_LOCATION } from '../auth/auth.service';
import { fakeLocation } from '../auth/testing';
import { DeploymentConfig, mergeDeploymentConfig } from '../config/deployment-config';
import { DeploymentConfigService } from '../config/deployment-config.service';
import { LANGUAGE_STORAGE_KEY, I18nService } from './i18n.service';
import { LANGUAGES, Language } from './languages';

/** A second language for switching tests: Latin, so lorem ipsum. */
const LATIN: Language = {
  id: 'la',
  label: 'Lorem ipsum',
  localeData: () => import('@angular/common/locales/la'),
};

describe('I18nService', () => {
  let location: ReturnType<typeof fakeLocation>;

  beforeEach(() => {
    localStorage.clear();
    LANGUAGES.push(LATIN);
    location = fakeLocation();
  });

  afterEach(() => LANGUAGES.splice(LANGUAGES.indexOf(LATIN), 1));

  async function load(overrides: Partial<DeploymentConfig> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideTranslocoTesting({ la: { dashboard: { title: 'Tabula' } } }),
        { provide: BROWSER_LOCATION, useValue: location },
        {
          provide: DeploymentConfigService,
          useValue: { load: () => of(mergeDeploymentConfig(overrides)) },
        },
      ],
    });
    const i18n = TestBed.inject(I18nService);
    await i18n.load();
    return i18n;
  }

  const html = () => TestBed.inject(DOCUMENT).documentElement;
  const transloco = () => TestBed.inject(TranslocoService);

  it('starts in the deployment default and applies it everywhere', async () => {
    const i18n = await load();
    expect(i18n.language().id).toBe('en-GB');
    expect(i18n.locale()).toBe('en-GB');
    expect(html().lang).toBe('en-GB');
    expect(transloco().getActiveLang()).toBe('en-GB');
    expect(transloco().translate('dashboard.title')).toBe('Dashboard');
  });

  it('honours a different deployment default', async () => {
    const i18n = await load({ defaultLanguage: 'la' });
    expect(i18n.language().id).toBe('la');
    expect(transloco().translate('dashboard.title')).toBe('Tabula');
  });

  it('prefers the stored choice', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'la');
    const i18n = await load();
    expect(i18n.language().id).toBe('la');
    expect(i18n.locale()).toBe('la');
    expect(html().lang).toBe('la');
  });

  it('offers only the configured languages and ignores a stored choice outside them', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'la');
    const i18n = await load({ languages: 'en-GB' });
    expect(i18n.languages().map((l) => l.id)).toEqual(['en-GB']);
    expect(i18n.language().id).toBe('en-GB');
  });

  it('offers every language when the configured list matches none', async () => {
    const i18n = await load({ languages: 'xx, yy' });
    expect(i18n.languages().map((l) => l.id)).toEqual(['en-GB', 'la']);
  });

  it("keeps Angular's built-in locale when locale data fails to load", async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(LATIN, 'localeData').mockRejectedValue(new Error('chunk failed'));
    const i18n = await load({ defaultLanguage: 'la' });
    expect(i18n.locale()).toBe('en-US');
    expect(transloco().getActiveLang()).toBe('la');
    expect(error).toHaveBeenCalled();
  });

  it('stores a new choice and reloads into it', async () => {
    const i18n = await load();
    i18n.setLanguage('la');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('la');
    expect(location.reload).toHaveBeenCalledTimes(1);
  });

  it('ignores the current language and unknown ones', async () => {
    const i18n = await load();
    i18n.setLanguage('en-GB');
    i18n.setLanguage('xx');
    expect(location.reload).not.toHaveBeenCalled();
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
  });
});
