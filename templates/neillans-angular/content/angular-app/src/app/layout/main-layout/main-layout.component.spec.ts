import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, BROWSER_LOCATION } from '../../core/auth/auth.service';
import { FakeAuthService, fakeLocation, testUser } from '../../core/auth/testing';
import { MainLayoutComponent, initialsOf, visibleSections } from './main-layout.component';

describe('MainLayoutComponent', () => {
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
