import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { OrdersStore } from '@liveops/orders-data-access';
import { EmptyState } from '@liveops/ui';
import { formatCurrency } from '@liveops/utils';

/**
 * Displays the live order built up from "Add to Order" clicks in the
 * Inventory MFE. Reads directly from the shared `OrdersStore` singleton -
 * the same instance the Inventory MFE writes to - so this list stays in
 * sync across MFE boundaries with no extra wiring.
 */
@Component({
  selector: 'lib-current-order',
  standalone: true,
  imports: [ButtonModule, CardModule, EmptyState],
  templateUrl: './current-order.html',
  styleUrl: './current-order.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentOrder {
  protected readonly ordersStore = inject(OrdersStore);
  protected readonly formatCurrency = formatCurrency;

  protected lineTotal(price: number, quantity: number): string {
    return formatCurrency(price * quantity);
  }
}
