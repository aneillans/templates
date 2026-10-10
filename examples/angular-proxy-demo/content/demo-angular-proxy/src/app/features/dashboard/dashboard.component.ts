import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmService } from '../../core/ui/confirm.service';
import { ToastService } from '../../core/ui/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

@Component({
  selector: 'app-dashboard',
  imports: [PageHeaderComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Dashboard" [subtitle]="'Signed in as ' + auth.displayName()" />

    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Your session</h5>
            <dl class="row mb-0 mt-3">
              <dt class="col-sm-3">Name</dt>
              <dd class="col-sm-9">{{ auth.displayName() }}</dd>
              <dt class="col-sm-3">Email</dt>
              <dd class="col-sm-9">{{ auth.email() || 'none' }}</dd>
              <dt class="col-sm-3">Roles</dt>
              <dd class="col-sm-9 mb-0 d-flex flex-wrap gap-1">
                @for (role of auth.roles(); track role) {
                  <app-status-badge [label]="role" colour="primary" icon="bi-person-badge" />
                } @empty {
                  none
                }
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">UI services</h5>
            <p class="text-muted-2">ToastService and ConfirmService work from any component.</p>
            <div class="d-flex flex-wrap gap-2">
              <button type="button" class="btn btn-primary" (click)="showToast()">
                <i class="bi bi-bell me-1" aria-hidden="true"></i>Show a toast
              </button>
              <button type="button" class="btn btn-outline-danger" (click)="askToConfirm()">
                <i class="bi bi-question-circle me-1" aria-hidden="true"></i>Ask to confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  protected readonly auth = inject(AuthService);
  private readonly toasts = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected showToast(): void {
    this.toasts.success('Saved', 'Toasts close after a few seconds.');
  }

  protected async askToConfirm(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete the example?',
      message: 'Nothing is deleted; this shows the dialog.',
      confirmText: 'Delete',
      kind: 'danger',
    });
    this.toasts.info(ok ? 'Confirmed' : 'Cancelled');
  }
}
