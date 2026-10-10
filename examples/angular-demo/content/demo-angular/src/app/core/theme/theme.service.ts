import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_PREFIX } from '../../app-info';

/** The user's colour scheme choice; `system` follows the OS preference. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Also read by the inline script in index.html, which applies the theme before first paint. */
export const THEME_STORAGE_KEY = `${STORAGE_PREFIX}.theme`;

/**
 * Light/dark mode via Bootstrap 5.3 colour modes: sets `data-bs-theme` on `<html>`. The choice is
 * per browser. index.html applies it before Angular boots, so there is no flash of the wrong theme.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = safeStorage(this.document);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly mode = signal<ThemeMode>(readStoredMode(this.storage));
  readonly isDark = computed(
    () => this.mode() === 'dark' || (this.mode() === 'system' && this.systemDark()),
  );

  constructor() {
    this.media?.addEventListener('change', (event) => this.systemDark.set(event.matches));
    effect(() => {
      this.document.documentElement.setAttribute('data-bs-theme', this.isDark() ? 'dark' : 'light');
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    try {
      if (mode === 'system') this.storage?.removeItem(THEME_STORAGE_KEY);
      else this.storage?.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Storage full or blocked: the choice lasts until reload.
    }
  }
}

function safeStorage(document: Document): Storage | null {
  try {
    return document.defaultView?.localStorage ?? null;
  } catch {
    return null; // blocked by browser settings
  }
}

function readStoredMode(storage: Storage | null): ThemeMode {
  try {
    const stored = storage?.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}
