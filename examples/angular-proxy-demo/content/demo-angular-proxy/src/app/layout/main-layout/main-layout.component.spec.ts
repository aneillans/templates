import { WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, BROWSER_LOCATION } from '../../core/auth/auth.service';
import { FakeAuthService, fakeLocation, testUser } from '../../core/auth/testing';
import { I18nService } from '../../core/i18n/i18n.service';
import { LANGUAGES, Language } from '../../core/i18n/languages';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';
import { MainLayoutComponent, initialsOf, visibleSections } from './main-layout.component';

const LATIN: Language = { id: 'la', label: 'Lorem ipsum', localeData: () => Promise.reject() };

describe('MainLayoutComponent', () => {
  let auth: FakeAuthService;
  let i18n: {
    languages: WritableSignal<Language[]>;
    language: WritableSignal<Language>;
    setLanguage: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    i18n = { languages: signal(LANGUAGES), language: signal(LANGUAGES[0]), setLanguage: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: AuthService, useClass: FakeAuthService },
        { provide: BROWSER_LOCATION, useValue: fakeLocation() },
        { provide: I18nService, useValue: i18n },
      ],
    });
    auth = TestBed.inject(AuthService) as FakeAuthService;
  });

  async function render() {
    const fixture = TestBed.createComponent(MainLayoutComponent);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const menuLabels = (element: HTMLElement) =>
    [...element.querySelectorAll('.menu-link span')].map((span) => span.textContent?.trim());

  it('hides admin navigation from other users', async () => {
    auth.user.set(testUser({ roles: ['user'] }));
    const element = await render();
    expect(menuLabels(element)).toEqual(['Dashboard']);
    expect(element.textContent).not.toContain('Administration');
  });

  it('shows admin navigation to admins', async () => {
    auth.user.set(testUser({ roles: ['admin'] }));
    expect(menuLabels(await render())).toEqual(['Dashboard', 'Admin']);
  });

  it('shows the user and signs out', async () => {
    auth.user.set(testUser({ name: 'Jane Doe' }));
    const element = await render();
    expect(element.querySelector('.avatar')?.textContent?.trim()).toBe('JD');
    element.querySelector<HTMLButtonElement>('.dropdown-item.text-danger')!.click();
    expect(auth.signOutCalls).toBe(1);
  });

  it('hides the language menu when only one language is offered', async () => {
    auth.user.set(testUser());
    expect((await render()).querySelector('.bi-translate')).toBeNull();
  });

  it('switches language from the language menu', async () => {
    auth.user.set(testUser());
    i18n.languages.set([...LANGUAGES, LATIN]);
    const element = await render();
    const latin = element.querySelector<HTMLButtonElement>('button[lang="la"]')!;
    expect(latin.textContent?.trim()).toBe('Lorem ipsum');
    latin.click();
    expect(i18n.setLanguage).toHaveBeenCalledWith('la');
  });
});

describe('visibleSections', () => {
  it('drops sections left empty', () => {
    const sections = [
      { items: [{ label: 'A', icon: '', link: '/a' }] },
      { header: 'Ops', items: [{ label: 'B', icon: '', link: '/b', roles: ['ops'] }] },
    ];
    expect(visibleSections(sections, []).map((s) => s.items.length)).toEqual([1]);
    expect(visibleSections(sections, ['ops']).length).toBe(2);
  });
});

describe('initialsOf', () => {
  it.each([
    ['Jane Doe', 'JD'],
    ['jane.doe@example.com', 'JD'],
    ['demo-admin', 'DA'],
    ['alice', 'A'],
    ['', '?'],
  ])('%s → %s', (name, initials) => expect(initialsOf(name)).toBe(initials));
});
