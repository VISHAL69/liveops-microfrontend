import {
  calculateInventoryValue,
  countLowStock,
  countOutOfStock,
  groupByCategory,
} from './dashboard-metrics';
import { Product } from '@liveops/products-data-access';

function product(overrides: Partial<Product>): Product {
  return {
    id: 1,
    title: 'Test',
    description: '',
    category: 'misc',
    price: 10,
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

describe('dashboard-metrics', () => {
  const products: Product[] = [
    product({ id: 1, price: 10, stock: 20, category: 'phones' }),
    product({ id: 2, price: 5, stock: 0, category: 'phones' }),
    product({ id: 3, price: 20, stock: 3, category: 'laptops' }),
  ];

  it('calculates inventory value as sum(price * stock)', () => {
    expect(calculateInventoryValue(products)).toBe(10 * 20 + 5 * 0 + 20 * 3);
  });

  it('counts low stock products (stock > 0 and <= threshold)', () => {
    expect(countLowStock(products)).toBe(1);
  });

  it('counts out of stock products (stock === 0)', () => {
    expect(countOutOfStock(products)).toBe(1);
  });

  it('groups products by category, sorted by count descending', () => {
    expect(groupByCategory(products)).toEqual([
      { category: 'phones', count: 2 },
      { category: 'laptops', count: 1 },
    ]);
  });
});
