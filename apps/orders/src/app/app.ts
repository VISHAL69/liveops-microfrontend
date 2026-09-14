import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';

import { OrdersApiService } from '@liveops/orders-data-access';
import { Order, OrderStatus, deriveOrderStatus } from '@liveops/orders-data-access';
import { CurrentOrder } from '@liveops/orders-ui';
import { formatCurrency } from '@liveops/utils';
import { LoadingState, EmptyState, PageHeader } from '@liveops/ui';

const STATUS_SEVERITY: Record<OrderStatus, 'success' | 'info' | 'warn'> = {
  fulfilled: 'success',
  processing: 'info',
  pending: 'warn',
};

@Component({
  selector: 'liveops-orders-root',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    TagModule,
    SelectModule,
    ButtonModule,
    DialogModule,
    MessageModule,
    LoadingState,
    EmptyState,
    PageHeader,
    CurrentOrder,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly ordersApi = inject(OrdersApiService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly allOrders = signal<Order[]>([]);
  protected readonly statusFilter = signal<OrderStatus | null>(null);
  protected readonly selectedOrder = signal<Order | null>(null);
  protected readonly detailsVisible = signal(false);

  protected readonly statusOptions: { label: string; value: OrderStatus }[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Fulfilled', value: 'fulfilled' },
  ];

  protected readonly filteredOrders = computed(() => {
    const status = this.statusFilter();
    return status
      ? this.allOrders().filter((order) => order.status === status)
      : this.allOrders();
  });

  protected readonly formatCurrency = formatCurrency;
  protected readonly statusSeverity = STATUS_SEVERITY;

  protected severityFor(status: OrderStatus): 'success' | 'info' | 'warn' {
    return STATUS_SEVERITY[status];
  }

  constructor() {
    forkJoin({
      carts: this.ordersApi.getCarts(0, 0),
      users: this.ordersApi.getUsers(),
    })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: ({ carts, users }) => {
          const userMap = new Map(
            users.users.map((u) => [u.id, `${u.firstName} ${u.lastName}`])
          );
          const orders: Order[] = carts.carts.map((cart) => ({
            ...cart,
            status: deriveOrderStatus(cart.id),
            customerName: userMap.get(cart.userId) ?? `User #${cart.userId}`,
          }));
          this.allOrders.set(orders);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Unable to load orders from the API.');
          this.loading.set(false);
        },
      });
  }

  protected onStatusFilterChange(status: OrderStatus | null): void {
    this.statusFilter.set(status);
  }

  protected viewDetails(order: Order): void {
    this.selectedOrder.set(order);
    this.detailsVisible.set(true);
  }
}
