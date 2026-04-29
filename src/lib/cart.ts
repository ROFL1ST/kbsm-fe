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
  cart_id: number;
  quantity: number;
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

export type CartResponseData = {
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

export function calculateCartSummary(items: CartItem[]): CartSummary {
  return items.reduce(
    (summary, item) => ({
      total_price: summary.total_price + item.calculation.total_price,
      discount_amount: summary.discount_amount + item.calculation.discount_amount,
      final_price: summary.final_price + item.calculation.final_price,
    }),
    {
      total_price: 0,
      discount_amount: 0,
      final_price: 0,
    },
  );
}

export function calculateCartItemSummary(
  product: ProductApiItem,
  quantity: number,
): CartSummary {
  const unitPrice = product.discount_flag ? product.final_price : product.price;

  return {
    total_price: product.price * quantity,
    discount_amount: product.discount_flag ? product.discount_amount * quantity : 0,
    final_price: unitPrice * quantity,
  };
}

export function updateCartItemLocally(
  item: CartItem,
  patch: Pick<UpdateCartItemRequest, "quantity" | "is_selected">,
): CartItem {
  return {
    ...item,
    quantity: patch.quantity,
    is_selected: patch.is_selected ?? item.is_selected,
    calculation: calculateCartItemSummary(item.product, patch.quantity),
  };
}

export function createCartItemFromProduct(
  product: ProductApiItem,
  quantity: number,
  userId: string,
): CartItem {
  const unitPrice = product.discount_flag ? product.final_price : product.price;

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
      total_price: product.price * quantity,
      discount_amount: product.discount_flag ? product.discount_amount * quantity : 0,
      final_price: unitPrice * quantity,
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

  if (!Number.isFinite(request.cart_id) || request.cart_id <= 0) {
    throw new Error("Item keranjang tidak valid.");
  }

  if (!Number.isFinite(request.quantity) || request.quantity <= 0) {
    throw new Error("Quantity produk harus lebih dari 0.");
  }

  const body: Record<string, unknown> = {
    cart_id: request.cart_id,
    user_id: userId,
    quantity: request.quantity,
  };

  if (request.is_selected !== undefined) {
    body.is_selected = request.is_selected;
  }

  const payload = await fetchAuth<UpdateCartItemResponse>("/carts/update", {
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

export async function removeCartItem(id: number) {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Item keranjang tidak valid.");
  }

  const payload = await fetchAuth<unknown>(`/carts/remove?cart_id=${encodeURIComponent(String(id))}`, {
    method: "DELETE",
  });

  dispatchCartStateChange();
  return payload;
}
