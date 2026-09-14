import { Product } from '@liveops/products-data-access';

/**
 * A single line in the user's in-progress order, built up by clicking
 * "Add to Order" in the Inventory MFE. This is distinct from `Cart`/`Order`
 * (DummyJSON's historical carts) - it's live, client-side order state shared
 * between the Inventory and Orders MFEs.
 */
export interface OrderItem {
  product: Product;
  quantity: number;
}
