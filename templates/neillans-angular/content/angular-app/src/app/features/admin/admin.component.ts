import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DeploymentConfigService } from '../../core/config/deployment-config.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

/** Admin-only page (see adminGuard). Calls an admin-only API endpoint to prove the token flows. */
@Component({
  selector: 'app-admin',
  imports: [PageHeaderComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Admin" subtitle="Only users with the admin role reach this page.">
      <button
        type="button"
        class="btn btn-outline-primary"
        [disabled]="result.isLoading()"
        (click)="result.reload()"
      >
        <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>Call again
      </button>
    </app-page-header>

    <div class="card">
      <div class="card-body">
        <h5 class="card-title">
          <code>GET {{ endpoint() }}</code>
        </h5>
        <div class="mt-3">
          @if (result.isLoading()) {
            <app-status-badge label="Loading" colour="info" icon="bi-hourglass-split" />
          } @else if (result.hasValue()) {
            <app-status-badge label="200" colour="success" icon="bi-check-circle" />
            <span class="ms-2">{{ result.value().message }}</span>
          } @else {
            <app-status-badge label="Failed" colour="danger" icon="bi-x-circle" />
            <span class="ms-2">{{ errorText() }}</span>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminComponent {
  private readonly config = inject(DeploymentConfigService).config;

  protected readonly endpoint = computed(() => `${this.config().apiBaseUrl}/secure/admin`);
  protected readonly result = httpResource<{ message: string }>(() => this.endpoint());

  protected readonly errorText = computed(() => {
    const error = this.result.error();
    return error instanceof HttpErrorResponse
      ? `HTTP ${error.status || 'no response'}`
      : 'API not reachable';
  });
}
