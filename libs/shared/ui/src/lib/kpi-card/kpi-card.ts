import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';

export type KpiTrend = 'up' | 'down' | 'neutral';

@Component({
  selector: 'lib-kpi-card',
  standalone: true,
  imports: [CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="kpi-card" [class]="'kpi-card--' + severity()">
      <div class="kpi-card__body">
        <div class="kpi-card__icon">
          <i [class]="icon()"></i>
        </div>
        <div class="kpi-card__content">
          <span class="kpi-card__label">{{ label() }}</span>
          <span class="kpi-card__value">{{ value() }}</span>
          @if (subLabel()) {
            <span class="kpi-card__sub">{{ subLabel() }}</span>
          }
        </div>
      </div>
    </p-card>
  `,
  styles: [
    `
      .kpi-card__body {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .kpi-card__icon {
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--p-primary-100, #e0e7ff);
        color: var(--p-primary-600, #4f46e5);
        font-size: 1.25rem;
        flex-shrink: 0;
      }
      :host-context(.kpi-card--danger) .kpi-card__icon {
        background: var(--p-red-100, #fee2e2);
        color: var(--p-red-600, #dc2626);
      }
      :host-context(.kpi-card--warning) .kpi-card__icon {
        background: var(--p-yellow-100, #fef9c3);
        color: var(--p-yellow-600, #ca8a04);
      }
      :host-context(.kpi-card--success) .kpi-card__icon {
        background: var(--p-green-100, #dcfce7);
        color: var(--p-green-600, #16a34a);
      }
      .kpi-card__content {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .kpi-card__label {
        font-size: 0.8rem;
        color: var(--p-text-muted-color, #6b7280);
        font-weight: 500;
      }
      .kpi-card__value {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.3;
      }
      .kpi-card__sub {
        font-size: 0.75rem;
        color: var(--p-text-muted-color, #6b7280);
      }
    `,
  ],
})
export class KpiCard {
  label = input.required<string>();
  value = input.required<string | number>();
  subLabel = input<string>();
  icon = input<string>('pi pi-chart-bar');
  severity = input<'default' | 'success' | 'warning' | 'danger'>('default');
}
