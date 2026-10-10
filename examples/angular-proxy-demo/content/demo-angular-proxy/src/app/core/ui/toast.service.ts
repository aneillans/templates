import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  text?: string;
}

/** App-wide toast notifications, rendered once by ToastContainerComponent. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  /** Shows a toast, dismissed after `timeoutMs` (0 keeps it until closed). Returns its id. */
  show(kind: ToastKind, title: string, text?: string, timeoutMs = 5000): number {
    const id = ++this.seq;
    this.toasts.update((toasts) => [...toasts, { id, kind, title, text }]);
    if (timeoutMs > 0) {
      setTimeout(() => this.dismiss(id), timeoutMs);
    }
    return id;
  }

  success(title: string, text?: string): number {
    return this.show('success', title, text);
  }

  /** Errors stay up longer. */
  error(title: string, text?: string): number {
    return this.show('danger', title, text, 8000);
  }

  info(title: string, text?: string): number {
    return this.show('info', title, text);
  }

  warning(title: string, text?: string): number {
    return this.show('warning', title, text);
  }

  dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
