import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  const html = () => TestBed.inject(DOCUMENT).documentElement;

  beforeEach(() => localStorage.clear());

  it('defaults to system and applies light when the OS has no dark preference', () => {
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(theme.mode()).toBe('system');
    expect(html().getAttribute('data-bs-theme')).toBe('light');
  });

  it('restores a stored choice', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(theme.mode()).toBe('dark');
    expect(html().getAttribute('data-bs-theme')).toBe('dark');
  });

  it('ignores an unknown stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(TestBed.inject(ThemeService).mode()).toBe('system');
  });

  it('applies and stores a new choice, and forgets it for system', () => {
    const theme = TestBed.inject(ThemeService);
    theme.setMode('dark');
    TestBed.tick();
    expect(html().getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    theme.setMode('system');
    TestBed.tick();
    expect(html().getAttribute('data-bs-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });
});
