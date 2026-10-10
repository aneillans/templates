import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { APP_TITLE } from './app-info';

/**
 * Page title is `<translated route title> · <app title>`, or just the app title for untitled
 * routes. Route `title` values are translation keys (see `marker` in core/i18n/languages.ts).
 */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.title.setTitle(key ? `${this.transloco.translate(key)} · ${APP_TITLE}` : APP_TITLE);
  }
}
