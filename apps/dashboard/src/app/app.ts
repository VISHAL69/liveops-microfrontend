import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { MessageModule } from 'primeng/message';

import { ProductsApiService } from '@liveops/products-data-access';
import { Product } from '@liveops/products-data-access';
import { OrdersApiService } from '@liveops/orders-data-access';
import { Cart } from '@liveops/orders-data-access';
import {
  calculateInventoryValue,
  countLowStock,
  countOutOfStock,
  formatCurrency,
  formatNumber,
  groupByCategory,
} from '@liveops/utils';
import { KpiCard, PageHeader, LoadingState, EmptyState } from '@liveops/ui';
import { StockStatusTag } from '@liveops/products-ui';

@Component({
  selector: 'liveops-dashboard-root',
  standalone: true,
  imports: [
    CardModule,
    TableModule,
    TagModule,
    ChartModule,
    MessageModule,
    KpiCard,
    PageHeader,
    LoadingState,
    EmptyState,
    StockStatusTag,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly productsApi = inject(ProductsApiService);
  private readonly ordersApi = inject(OrdersApiService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly products = signal<Product[]>([]);
  private readonly carts = signal<Cart[]>([]);

  protected readonly totalProducts = computed(() => this.products().length);
  protected readonly lowStockCount = computed(() => countLowStock(this.products()));
  protected readonly outOfStockCount = computed(() => countOutOfStock(this.products()));
  protected readonly inventoryValue = computed(() =>
    formatCurrency(calculateInventoryValue(this.products()))
  );
  protected readonly totalOrders = computed(() => this.carts().length);

  protected readonly lowStockProducts = computed(() =>
    this.products()
      .filter((p) => p.stock > 0 && p.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6)
  );

  protected readonly recentOrders = computed(() =>
    [...this.carts()].sort((a, b) => b.id - a.id).slice(0, 6)
  );

  protected readonly categoryChartData = computed(() => {
    const distribution = groupByCategory(this.products()).slice(0, 6);
    return {
      labels: distribution.map((d) => this.toTitleCase(d.category)),
      datasets: [
        {
          label: 'Products',
          data: distribution.map((d) => d.count),
          backgroundColor: [
            '#6366f1',
            '#22c55e',
            '#f59e0b',
            '#ef4444',
            '#06b6d4',
            '#a855f7',
          ],
        },
      ],
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly chartOptions: any = {
    plugins: { legend: { position: 'bottom' } },
    responsive: true,
    maintainAspectRatio: false,
  };

  protected readonly formatCurrency = formatCurrency;
  protected readonly formatNumber = formatNumber;

  constructor() {
    forkJoin({
      products: this.productsApi.getProducts(0, 0),
      carts: this.ordersApi.getCarts(0, 0),
    })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: ({ products, carts }) => {
          this.products.set(products.products);
          this.carts.set(carts.carts);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Unable to load operational data from the API.');
          this.loading.set(false);
        },
      });
  }

  private toTitleCase(value: string): string {
    return value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
