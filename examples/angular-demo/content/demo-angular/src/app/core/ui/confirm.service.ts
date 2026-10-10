import { Injectable, signal } from '@angular/core';

/** Callers pass translated text; the buttons default to translated Confirm and Cancel. */
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Colour of the confirm button. */
  kind?: 'primary' | 'danger' | 'warning';
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

/**
 * Promise-based confirmation dialog, rendered once by ConfirmDialogComponent:
 * `if (await confirm.ask({ title, message, kind: 'danger' })) { ... }`.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<ConfirmRequest | null>(null);

  /** Resolves `true` on confirm, `false` on cancel. A new request cancels any open one. */
  ask(options: ConfirmOptions): Promise<boolean> {
    this.respond(false);
    return new Promise<boolean>((resolve) => this.current.set({ ...options, resolve }));
  }

  respond(ok: boolean): void {
    const request = this.current();
    if (request) {
      this.current.set(null);
      request.resolve(ok);
    }
  }
}
