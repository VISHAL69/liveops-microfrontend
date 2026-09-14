import { Injectable, computed, signal } from '@angular/core';
import { Product } from '@liveops/products-data-access';

const MAX_RECENTLY_VIEWED = 5;

/**
 * The one piece of state that genuinely benefits from living outside a single
 * MFE: "recently viewed products", since a user may view a product in the
 * Inventory MFE and later want that context reflected on the Dashboard.
 *
 * Provided in root so the Shell and every lazy-loaded remote share the same
 * singleton instance at runtime (Angular + this service are shared
 * dependencies via Module Federation).
 */
@Injectable({ providedIn: 'root' })
export class RecentlyViewedStore {
  private readonly _items = signal<Product[]>([]);

  readonly items = computed(() => this._items());
  readonly hasItems = computed(() => this._items().length > 0);

  record(product: Product): void {
    const withoutDuplicate = this._items().filter((p) => p.id !== product.id);
    this._items.set([product, ...withoutDuplicate].slice(0, MAX_RECENTLY_VIEWED));
  }

  clear(): void {
    this._items.set([]);
  }
}
