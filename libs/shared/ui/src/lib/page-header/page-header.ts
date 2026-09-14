import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-header__title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-header__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .page-header__title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
      }
      .page-header__subtitle {
        margin: 0.25rem 0 0;
        color: var(--p-text-muted-color, #6b7280);
        font-size: 0.9rem;
      }
      .page-header__actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    `,
  ],
})
export class PageHeader {
  title = input.required<string>();
  subtitle = input<string>();
}
