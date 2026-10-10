import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Page title and optional subtitle. Projected content (buttons) sits on the right. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
      <div>
        <h4 class="mb-0">{{ title() }}</h4>
        @if (subtitle()) {
          <span class="text-muted-2">{{ subtitle() }}</span>
        }
      </div>
      <div class="d-flex gap-2">
        <ng-content />
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
