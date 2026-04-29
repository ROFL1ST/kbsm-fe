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

type UpdateCartItemRequest = {
  id: number;
  quantity?: number;
  is_selected?: boolean;
  user_id?: string;
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

export type DirectCheckoutState = {
  mode: "direct";
  item: CartItem;
};

type CartResponseData = {
  summary: CartSummary;
  items: CartItem[];
};

type UpdateCartItemResponse = CartItem | CartResponseData | { id?: number | string };

export function dispatchCartStateChange() {
  window.dispatchEvent(new Event(CART_STATE_CHANGE_EVENT));
}

export function getCartItemCountFromItems(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function createCartItemFromProduct(
  product: ProductApiItem,
  quantity: number,
  userId: string,
): CartItem {
  const unitPrice = product.discount_flag ? product.final_price : product.price;
  const totalPrice = product.price * quantity;
  const discountAmount = product.discount_flag ? product.discount_amount * quantity : 0;
  const finalPrice = unitPrice * quantity;

  return {
    id: 0,
    user_id: userId,
    product_id: product.product_id,
    product_detail_id: product.product_detail_id,
    product_unit_id: product.product_unit_id,
    quantity,
    is_selected: true,
    product,
    calculation: {
      total_price: totalPrice,
      discount_amount: discountAmount,
      final_price: finalPrice,
    },
  };
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

export async function updateCartItem(request: UpdateCartItemRequest) {
  const authUser = getAuthUser();
  const userId = request.user_id ?? authUser?.id;

  if (!userId) {
    throw new Error("Token otentikasi tidak ditemukan. Silakan login kembali.");
  }

  if (!Number.isFinite(request.id) || request.id <= 0) {
    throw new Error("Item keranjang tidak valid.");
  }

  if (
    request.quantity !== undefined &&
    (!Number.isFinite(request.quantity) || request.quantity <= 0)
  ) {
    throw new Error("Quantity produk harus lebih dari 0.");
  }

  const body: Record<string, unknown> = {
    id: request.id,
    user_id: userId,
  };

  if (request.quantity !== undefined) {
    body.quantity = request.quantity;
  }

  if (request.is_selected !== undefined) {
    body.is_selected = request.is_selected;
  }

  const payload = await fetchAuth<UpdateCartItemResponse>("/carts", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  dispatchCartStateChange();
  return payload as ApiEnvelope<UpdateCartItemResponse>;
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
