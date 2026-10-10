import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ToastKind, ToastService } from '../../core/ui/toast.service';

const ICONS: Record<ToastKind, string> = {
  success: 'bi-check-circle-fill',
  danger: 'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
};

/** Renders ToastService's toasts. Placed once, in AppComponent. */
@Component({
  selector: 'app-toast-container',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="toast show border-0 shadow"
          [attr.role]="toast.kind === 'danger' ? 'alert' : 'status'"
        >
          <div class="toast-header">
            <i class="bi me-2 {{ icons[toast.kind] }} text-{{ toast.kind }}" aria-hidden="true"></i>
            <strong class="me-auto">{{ toast.title }}</strong>
            <button
              type="button"
              class="btn-close"
              [attr.aria-label]="'common.close' | transloco"
              (click)="toasts.dismiss(toast.id)"
            ></button>
          </div>
          @if (toast.text) {
            <div class="toast-body">{{ toast.text }}</div>
          }
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toasts = inject(ToastService);
  protected readonly icons = ICONS;
}
