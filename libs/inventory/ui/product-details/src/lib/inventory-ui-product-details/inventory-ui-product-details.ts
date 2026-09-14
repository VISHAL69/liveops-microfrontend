import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Product } from '@liveops/products-data-access';
import { StockStatusTag } from '@liveops/products-ui';
import { formatCurrency } from '@liveops/utils';

/**
 * Read-only product details dialog used by the Inventory MFE.
 * Purely presentational: the parent owns visibility state and the
 * selected product.
 */
@Component({
  selector: 'lib-inventory-product-details',
  standalone: true,
  imports: [DialogModule, StockStatusTag],
  templateUrl: './inventory-ui-product-details.html',
  styleUrl: './inventory-ui-product-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryProductDetails {
  product = input<Product | null>(null);
  visible = input<boolean>(false);
  visibleChange = output<boolean>();

  protected readonly formatCurrency = formatCurrency;

  protected discountedPrice(product: Product): number {
    return product.price * (1 - product.discountPercentage / 100);
  }

  protected onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }
}
