import { Product } from '@liveops/products-data-access';

export interface CategoryDistribution {
  category: string;
  count: number;
}

/** sum(price * stock) across the given products */
export function calculateInventoryValue(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.price * p.stock, 0);
}

export function countLowStock(products: Product[], threshold = 10): number {
  return products.filter((p) => p.stock > 0 && p.stock <= threshold).length;
}

export function countOutOfStock(products: Product[]): number {
  return products.filter((p) => p.stock === 0).length;
}

/** Groups products by category and returns counts, sorted descending */
export function groupByCategory(products: Product[]): CategoryDistribution[] {
  const map = new Map<string, number>();
  for (const product of products) {
    map.set(product.category, (map.get(product.category) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
