import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { getStockStatus, StockStatus } from '@liveops/products-data-access';

const SEVERITY_MAP: Record<StockStatus, 'success' | 'warn' | 'danger'> = {
  'in-stock': 'success',
  'low-stock': 'warn',
  'out-of-stock': 'danger',
};

const LABEL_MAP: Record<StockStatus, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
};

@Component({
  selector: 'lib-stock-status',
  standalone: true,
  imports: [TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p-tag [value]="label()" [severity]="severity()" />`,
})
export class StockStatusTag {
  stock = input.required<number>();

  private readonly status = computed(() => getStockStatus(this.stock()));
  readonly label = computed(() => LABEL_MAP[this.status()]);
  readonly severity = computed(() => SEVERITY_MAP[this.status()]);
}
