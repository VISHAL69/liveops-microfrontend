import { Injectable, computed, signal } from '@angular/core';
import { Product } from '@liveops/products-data-access';
import { OrderItem } from '@liveops/orders-data-access';

/**
 * `OrdersStore` is compiled separately into every remote that imports it
 * (Inventory, Orders) - Native Federation's `shareAll()` only dedupes real
 * npm packages listed in package.json, and `@liveops/orders-data-access` is
 * a TS path-mapped workspace library, not one. That means each remote ends
 * up with its own distinct `OrdersStore` *class*, so relying on Angular's
 * `providedIn: 'root'` singleton behavior alone would silently give each
 * MFE its own independent store instead of one shared cart.
 *
 * What genuinely is shared across independently-built federated bundles
 * running in the same browser tab is `globalThis` - it's the same JS
 * global object no matter how many copies of a class get bundled. So the
 * actual order data lives in a small object on `globalThis`, and every
 * `OrdersStore` instance (one per remote) reads/writes that same object and
 * notifies every other instance via a shared listener set. Each instance
 * still exposes normal Angular Signals, so nothing about how components
 * consume this service changes.
 */
interface OrdersBus {
  items: OrderItem[];
  listeners: Set<() => void>;
}

const ORDERS_BUS_KEY = '__liveopsOrdersBus__';

type GlobalWithOrdersBus = typeof globalThis & {
  [ORDERS_BUS_KEY]?: OrdersBus;
};

function getOrdersBus(): OrdersBus {
  const globalWithBus = globalThis as GlobalWithOrdersBus;

  if (!globalWithBus[ORDERS_BUS_KEY]) {
    globalWithBus[ORDERS_BUS_KEY] = { items: [], listeners: new Set() };
  }

  return globalWithBus[ORDERS_BUS_KEY];
}

/** Test-only: clears the shared bus so specs don't leak state between runs. */
export function resetOrdersBusForTests(): void {
  delete (globalThis as GlobalWithOrdersBus)[ORDERS_BUS_KEY];
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly bus = getOrdersBus();
  private readonly _items = signal<OrderItem[]>(this.bus.items);

  readonly items = computed(() => this._items());
  readonly itemCount = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly total = computed(() =>
    this._items().reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  );

  constructor() {
    this.bus.listeners.add(() => this._items.set([...this.bus.items]));
  }

  /** Adds one unit of the product, incrementing quantity if it's already in the order. */
  addProduct(product: Product): void {
    const index = this.bus.items.findIndex((item) => item.product.id === product.id);

    this.bus.items =
      index >= 0
        ? this.bus.items.map((item, i) =>
            i === index ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...this.bus.items, { product, quantity: 1 }];

    this.notifyAll();
  }

  removeProduct(productId: number): void {
    this.bus.items = this.bus.items.filter((item) => item.product.id !== productId);
    this.notifyAll();
  }

  clear(): void {
    this.bus.items = [];
    this.notifyAll();
  }

  private notifyAll(): void {
    this.bus.listeners.forEach((listener) => listener());
  }
}
