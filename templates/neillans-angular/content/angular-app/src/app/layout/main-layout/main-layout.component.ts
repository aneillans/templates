import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { APP_TITLE } from '../../app-info';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeMode, ThemeService } from '../../core/theme/theme.service';
import { NAVIGATION, NavSection } from '../navigation';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: string;
}

const THEMES: ThemeOption[] = [
  { mode: 'light', label: 'Light', icon: 'bi-sun' },
  { mode: 'dark', label: 'Dark', icon: 'bi-moon-stars' },
  { mode: 'system', label: 'System', icon: 'bi-circle-half' },
];

/** Shell for signed-in pages: sidebar, top bar with theme and profile menus, and footer. */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);

  protected readonly appTitle = APP_TITLE;
  protected readonly year = new Date().getFullYear();
  protected readonly sidebarOpen = signal(false);

  protected readonly displayName = this.auth.displayName;
  protected readonly email = this.auth.email;
  protected readonly initials = computed(() => initialsOf(this.displayName()));

  protected readonly navigation = computed(() => visibleSections(NAVIGATION, this.auth.roles()));

  protected readonly themes = THEMES;
  protected readonly themeMode = this.theme.mode;
  protected readonly currentTheme = computed(
    () => THEMES.find((option) => option.mode === this.themeMode()) ?? THEMES[2],
  );

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected setTheme(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }

  protected signOut(): void {
    this.auth.signOut();
  }
}

/** Drops items the user lacks a role for, then sections left empty. */
export function visibleSections(sections: NavSection[], roles: readonly string[]): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.some((role) => roles.includes(role)),
      ),
    }))
    .filter((section) => section.items.length > 0);
}

/** Up to two initials from a display name or email, e.g. `jane.doe@x.com` → `JD`. */
export function initialsOf(name: string): string {
  const parts = name
    .replace(/@.*$/, '')
    .split(/[\s._-]+/)
    .filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}
