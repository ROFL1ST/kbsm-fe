import { fetchAuth, getAuthUser, type ApiEnvelope } from "./auth";
import { type ProductApiItem } from "./products";

export const CART_STATE_CHANGE_EVENT = "kbbu-cart-state-change";

type AddToCartRequest = {
  product_unit_id: number;
  quantity: number;
  user_id?: string;
};

type AddToCartResponse = {
  id?: number | string;
};

export type CartSummary = {
  total_price: number;
  discount_amount: number;
  final_price: number;
};

export type CartItem = {
  id: number;
  user_id: string;
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  quantity: number;
  is_selected: boolean;
  product: ProductApiItem;
  calculation: CartSummary;
};

type CartResponseData = {
  summary: CartSummary;
  items: CartItem[];
};

export function dispatchCartStateChange() {
  window.dispatchEvent(new Event(CART_STATE_CHANGE_EVENT));
}

export function getCartItemCountFromItems(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export async function addToCart(request: AddToCartRequest) {
  const authUser = getAuthUser();
  const userId = request.user_id ?? authUser?.id;

  if (!userId) {
    throw new Error("Kamu harus login dulu sebelum menambahkan produk ke keranjang.");
  }

  if (!Number.isFinite(request.quantity) || request.quantity <= 0) {
    throw new Error("Quantity produk harus lebih dari 0.");
  }

  if (!Number.isFinite(request.product_unit_id) || request.product_unit_id <= 0) {
    throw new Error("Produk yang dipilih tidak valid.");
  }

  const payload = await fetchAuth<AddToCartResponse>("/carts/add", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      quantity: request.quantity,
      product_unit_id: request.product_unit_id,
    }),
  });

  dispatchCartStateChange();
  return payload as ApiEnvelope<AddToCartResponse>;
}

export async function fetchCart() {
  const payload = await fetchAuth<CartResponseData>("/carts", {
    method: "GET",
  });

  if (!payload.data) {
    throw new Error("Data keranjang tidak tersedia.");
  }

  return payload.data;
}
