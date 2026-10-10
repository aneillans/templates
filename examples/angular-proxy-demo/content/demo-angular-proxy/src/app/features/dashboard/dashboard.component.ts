import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmService } from '../../core/ui/confirm.service';
import { ToastService } from '../../core/ui/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

@Component({
  selector: 'app-dashboard',
  imports: [PageHeaderComponent, StatusBadgeComponent, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      [title]="'dashboard.title' | transloco"
      [subtitle]="'dashboard.signedInAs' | transloco: { name: auth.displayName() }"
    />

    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ 'dashboard.session.title' | transloco }}</h5>
            <dl class="row mb-0 mt-3">
              <dt class="col-sm-3">{{ 'dashboard.session.name' | transloco }}</dt>
              <dd class="col-sm-9">{{ auth.displayName() }}</dd>
              <dt class="col-sm-3">{{ 'dashboard.session.email' | transloco }}</dt>
              <dd class="col-sm-9">{{ auth.email() || ('dashboard.session.none' | transloco) }}</dd>
              <dt class="col-sm-3">{{ 'dashboard.session.roles' | transloco }}</dt>
              <dd class="col-sm-9 mb-0 d-flex flex-wrap gap-1">
                @for (role of auth.roles(); track role) {
                  <app-status-badge [label]="role" colour="primary" icon="bi-person-badge" />
                } @empty {
                  {{ 'dashboard.session.none' | transloco }}
                }
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ 'dashboard.ui.title' | transloco }}</h5>
            <p class="text-muted-2">{{ 'dashboard.ui.text' | transloco }}</p>
            <div class="d-flex flex-wrap gap-2">
              <button type="button" class="btn btn-primary" (click)="showToast()">
                <i class="bi bi-bell me-1" aria-hidden="true"></i
                >{{ 'dashboard.ui.toast' | transloco }}
              </button>
              <button type="button" class="btn btn-outline-danger" (click)="askToConfirm()">
                <i class="bi bi-question-circle me-1" aria-hidden="true"></i
                >{{ 'dashboard.ui.confirm' | transloco }}
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
  private readonly transloco = inject(TranslocoService);

  protected showToast(): void {
    this.toasts.success(
      this.transloco.translate('dashboard.toast.title'),
      this.transloco.translate('dashboard.toast.text'),
    );
  }

  protected async askToConfirm(): Promise<void> {
    const ok = await this.confirm.ask({
      title: this.transloco.translate('dashboard.confirm.title'),
      message: this.transloco.translate('dashboard.confirm.message'),
      confirmText: this.transloco.translate('dashboard.confirm.action'),
      kind: 'danger',
    });
    this.toasts.info(
      ok
        ? this.transloco.translate('dashboard.confirm.confirmed')
        : this.transloco.translate('dashboard.confirm.cancelled'),
    );
  }
}
