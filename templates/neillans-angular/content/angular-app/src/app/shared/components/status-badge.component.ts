import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeColour = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';

/** Tonal badge (`bg-label-<colour>`) with an optional Bootstrap icon. */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge d-inline-flex align-items-center gap-1 bg-label-{{ colour() }}">
      @if (icon()) {
        <i class="bi {{ icon() }}" aria-hidden="true"></i>
      }
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly colour = input<BadgeColour>('secondary');
  readonly icon = input<string>();
}
