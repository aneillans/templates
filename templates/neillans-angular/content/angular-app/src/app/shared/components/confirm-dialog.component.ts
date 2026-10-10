import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { ConfirmService } from '../../core/ui/confirm.service';

/** Renders ConfirmService's current request as a modal. Placed once, in AppComponent. */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'confirm.respond(false)' },
  template: `
    @if (confirm.current(); as request) {
      <div
        class="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="confirm-dialog-title">{{ request.title }}</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Close"
                (click)="confirm.respond(false)"
              ></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">{{ request.message }}</p>
            </div>
            <div class="modal-footer">
              <button
                #cancelButton
                type="button"
                class="btn btn-outline-secondary"
                (click)="confirm.respond(false)"
              >
                {{ request.cancelText || 'Cancel' }}
              </button>
              <button
                type="button"
                class="btn btn-{{ request.kind || 'primary' }}"
                (click)="confirm.respond(true)"
              >
                {{ request.confirmText || 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    // Focus starts on Cancel, so Enter never confirms a destructive action by accident.
    effect(() => this.cancelButton()?.nativeElement.focus());
  }
}
