export interface CartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

export interface Cart {
  id: number;
  products: CartProduct[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}

export interface CartsResponse {
  carts: Cart[];
  total: number;
  skip: number;
  limit: number;
}

export interface OrderUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'fulfilled';

/**
 * View-model that combines a DummyJSON cart with derived order fields.
 * DummyJSON has no order status, so it is derived deterministically
 * from the cart id so the UI has something meaningful and stable to show.
 */
export interface Order extends Cart {
  status: OrderStatus;
  customerName: string;
}

export function deriveOrderStatus(cartId: number): OrderStatus {
  const bucket = cartId % 3;
  if (bucket === 0) return 'fulfilled';
  if (bucket === 1) return 'processing';
  return 'pending';
}
