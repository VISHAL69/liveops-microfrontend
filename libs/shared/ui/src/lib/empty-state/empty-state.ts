import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <i [class]="icon()" class="empty-state__icon"></i>
      <p class="empty-state__title">{{ title() }}</p>
      @if (description()) {
        <p class="empty-state__description">{{ description() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 3rem 1rem;
        color: var(--p-text-muted-color, #6b7280);
      }
      .empty-state__icon {
        font-size: 2rem;
        margin-bottom: 0.75rem;
        opacity: 0.6;
      }
      .empty-state__title {
        font-weight: 600;
        margin: 0;
        color: var(--p-text-color, #374151);
      }
      .empty-state__description {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class EmptyState {
  title = input<string>('No data found');
  description = input<string>();
  icon = input<string>('pi pi-inbox');
}
