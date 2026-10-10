import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, TitleStrategy, provideRouter } from '@angular/router';
import { provideTranslocoTesting } from '../testing/transloco-testing';
import { APP_TITLE } from './app-info';
import { AppTitleStrategy } from './app-title.strategy';

@Component({ template: '' })
class BlankComponent {}

describe('AppTitleStrategy', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'admin', title: 'admin.title', component: BlankComponent },
          { path: 'untitled', component: BlankComponent },
        ]),
        provideTranslocoTesting(),
        { provide: TitleStrategy, useClass: AppTitleStrategy },
      ],
    });
  });

  async function titleAt(url: string) {
    await TestBed.inject(Router).navigateByUrl(url);
    return TestBed.inject(Title).getTitle();
  }

  it('translates the route title and appends the app title', async () => {
    expect(await titleAt('/admin')).toBe(`Admin · ${APP_TITLE}`);
  });

  it('uses the app title alone for untitled routes', async () => {
    expect(await titleAt('/untitled')).toBe(APP_TITLE);
  });
});
