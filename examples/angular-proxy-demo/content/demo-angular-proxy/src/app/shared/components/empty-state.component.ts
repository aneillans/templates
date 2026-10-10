import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Placeholder for an empty list or page. Projected content (a call to action) goes underneath. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-center py-5">
      <div class="icon-tile mx-auto mb-3">
        <i class="bi fs-2 {{ icon() }}" aria-hidden="true"></i>
      </div>
      <h6 class="mb-1">{{ title() }}</h6>
      @if (text()) {
        <p class="text-muted-2 mb-3">{{ text() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly text = input<string>();
  readonly icon = input('bi-inbox');
}
