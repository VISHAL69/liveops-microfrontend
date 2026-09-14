import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';

import { ProductsApiService } from '@liveops/products-data-access';
import { Product } from '@liveops/products-data-access';
import { StockStatusTag } from '@liveops/products-ui';
import { OrdersStore } from '@liveops/orders-data-access';
import { RecentlyViewedStore } from '@liveops/inventory-data-access';
import { formatCurrency } from '@liveops/utils';
import { LoadingState, EmptyState } from '@liveops/ui';

import { InventoryProductDetails } from '@liveops/inventory-ui-product-details';

/**
 * Inventory's product listing: search, category filter, sortable/paginated
 * table, "Add to Order" (writes to the shared `OrdersStore`), and a details
 * dialog. This is the whole Inventory feature - the app shell just renders
 * this component behind the page header.
 */
@Component({
  selector: 'lib-inventory-products',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    InputTextModule,
    SelectModule,
    // Select,
    ButtonModule,
    ToolbarModule,
    MessageModule,
    LoadingState,
    EmptyState,
    StockStatusTag,
    InventoryProductDetails,
  ],
  templateUrl: './inventory-ui-products.html',
  styleUrl: './inventory-ui-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryProducts {
  private readonly productsApi = inject(ProductsApiService);
  private readonly recentlyViewed = inject(RecentlyViewedStore);
  protected readonly ordersStore = inject(OrdersStore);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly allProducts = signal<Product[]>([]);
  protected readonly categories = signal<string[]>([]);

  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal<string | null>(null);
  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly detailsVisible = signal(false);

  private readonly searchInput$ = new Subject<string>();

  protected readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.allProducts().filter((product) => {
      const matchesTerm =
        term.length === 0 ||
        product.title.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term);
      const matchesCategory = !category || product.category === category;
      return matchesTerm && matchesCategory;
    });
  });

  protected readonly formatCurrency = formatCurrency;

  constructor() {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.searchTerm.set(term));

    this.productsApi.getProducts(0, 0)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response) => {
          this.allProducts.set(response.products);
          this.categories.set(
            Array.from(new Set(response.products.map((p) => p.category))).sort()
          );
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Unable to load inventory from the API.');
          this.loading.set(false);
        },
      });
  }

  protected onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  protected onCategoryChange(category: string | null): void {
    this.selectedCategory.set(category);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
  }

  protected viewDetails(product: Product): void {
    this.selectedProduct.set(product);
    this.detailsVisible.set(true);
    this.recentlyViewed.record(product);
  }

  protected addToOrder(product: Product): void {
    this.ordersStore.addProduct(product);
  }
}
