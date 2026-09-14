import { OrdersStore, resetOrdersBusForTests } from './orders.store';
import { Product } from '@liveops/products-data-access';

function product(overrides: Partial<Product>): Product {
  return {
    id: 1,
    title: 'Laptop',
    description: '',
    category: 'laptops',
    price: 75000,
    discountPercentage: 0,
    rating: 4,
    stock: 20,
    tags: [],
    sku: 'sku',
    weight: 1,
    dimensions: { width: 1, height: 1, depth: 1 },
    warrantyInformation: '',
    shippingInformation: '',
    availabilityStatus: 'In Stock',
    reviews: [],
    returnPolicy: '',
    minimumOrderQuantity: 1,
    thumbnail: '',
    images: [],
    ...overrides,
  };
}

describe('OrdersStore', () => {
  beforeEach(() => {
    resetOrdersBusForTests();
  });

  it('starts empty', () => {
    const store = new OrdersStore();
    expect(store.items()).toEqual([]);
    expect(store.itemCount()).toBe(0);
    expect(store.total()).toBe(0);
  });

  it('adds a new product with quantity 1', () => {
    const store = new OrdersStore();
    const laptop = product({ id: 1, title: 'Laptop', price: 75000 });

    store.addProduct(laptop);

    expect(store.items()).toEqual([{ product: laptop, quantity: 1 }]);
    expect(store.itemCount()).toBe(1);
    expect(store.total()).toBe(75000);
  });

  it('increments quantity when the same product is added again', () => {
    const store = new OrdersStore();
    const laptop = product({ id: 1, title: 'Laptop', price: 75000 });

    store.addProduct(laptop);
    store.addProduct(laptop);

    expect(store.items()).toEqual([{ product: laptop, quantity: 2 }]);
    expect(store.itemCount()).toBe(2);
    expect(store.total()).toBe(150000);
  });

  it('tracks multiple distinct products independently', () => {
    const store = new OrdersStore();
    const laptop = product({ id: 1, title: 'Laptop', price: 75000 });
    const mouse = product({ id: 2, title: 'Wireless Mouse', price: 1500 });

    store.addProduct(laptop);
    store.addProduct(mouse);
    store.addProduct(laptop);

    expect(store.itemCount()).toBe(3);
    expect(store.total()).toBe(75000 * 2 + 1500);
  });

  it('removes a product from the order', () => {
    const store = new OrdersStore();
    const laptop = product({ id: 1 });
    store.addProduct(laptop);

    store.removeProduct(1);

    expect(store.items()).toEqual([]);
  });

  it('keeps two separate store instances in sync, simulating two independently-loaded MFEs', () => {
    // Each federated remote compiles its own copy of the OrdersStore class,
    // so this is the scenario that actually matters: two distinct instances
    // must still see the same order state via the shared global bus.
    const inventoryInstance = new OrdersStore();
    const ordersInstance = new OrdersStore();
    const laptop = product({ id: 1, title: 'Laptop', price: 75000 });

    inventoryInstance.addProduct(laptop);

    expect(ordersInstance.items()).toEqual([{ product: laptop, quantity: 1 }]);

    inventoryInstance.addProduct(laptop);

    expect(ordersInstance.items()).toEqual([{ product: laptop, quantity: 2 }]);
    expect(ordersInstance.total()).toBe(150000);
  });
});
