import { fetchAuth, getAuthUser, type ApiEnvelope } from "./auth";
import { type ProductApiItem } from "./products";

export const CART_STATE_CHANGE_EVENT = "kbbu-cart-state-change";

type AddToCartRequest = {
  product_unit_id: number;
  quantity: number;
  user_id?: string;
};

type UpdateCartRequest = {
  user_id?: string;
  quantity: number;
  cart_id: number;
  is_selected: boolean;
};

type AddToCartResponse = {
  id?: number | string;
};

type RemoveCartResponse = {
  id?: number | string;
};

type UpdateCartResponse = {
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

export type DirectCheckoutState = {
  mode: "direct";
  item: CartItem;
};

export type CartResponseData = {
  summary: CartSummary;
  items: CartItem[];
};

export function dispatchCartStateChange() {
  window.dispatchEvent(new Event(CART_STATE_CHANGE_EVENT));
}

export function getCartItemCountFromItems(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function calculateCartItemSummary(item: CartItem, quantity: number): CartSummary {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const totalPrice = item.product.price * safeQuantity;
  const discountAmount = item.product.discount_flag
    ? item.product.discount_amount * safeQuantity
    : 0;

  return {
    total_price: totalPrice,
    discount_amount: discountAmount,
    final_price: totalPrice - discountAmount,
  };
}

export function calculateCartSummary(items: CartItem[]) {
  return items
    .filter((item) => item.is_selected)
    .reduce<CartSummary>(
      (total, item) => ({
        total_price: total.total_price + item.calculation.total_price,
        discount_amount: total.discount_amount + item.calculation.discount_amount,
        final_price: total.final_price + item.calculation.final_price,
      }),
      {
        total_price: 0,
        discount_amount: 0,
        final_price: 0,
      },
    );
}

export function createCartItemFromProduct(product: ProductApiItem, quantity: number, userId = ""): CartItem {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  return {
    id: -product.product_unit_id,
    user_id: userId,
    product_id: product.product_id,
    product_detail_id: product.product_detail_id,
    product_unit_id: product.product_unit_id,
    quantity: safeQuantity,
    is_selected: true,
    product,
    calculation: {
      total_price: product.price * safeQuantity,
      discount_amount: (product.discount_flag ? product.discount_amount : 0) * safeQuantity,
      final_price: (product.discount_flag ? product.final_price : product.price) * safeQuantity,
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

export async function fetchCart() {
  const payload = await fetchAuth<CartResponseData>("/carts", {
    method: "GET",
  });

  if (!payload.data) {
    throw new Error("Data keranjang tidak tersedia.");
  }

  return payload.data;
}

export async function updateCartItem(request: UpdateCartRequest) {
  const authUser = getAuthUser();
  const userId = request.user_id ?? authUser?.id;

  if (!userId) {
    throw new Error("Kamu harus login dulu sebelum mengubah keranjang.");
  }

  if (!Number.isFinite(request.cart_id) || request.cart_id <= 0) {
    throw new Error("Item keranjang yang dipilih tidak valid.");
  }

  if (!Number.isFinite(request.quantity) || request.quantity <= 0) {
    throw new Error("Quantity produk harus lebih dari 0.");
  }

  const payload = await fetchAuth<UpdateCartResponse>("/carts/update", {
    method: "PATCH",
    body: JSON.stringify({
      user_id: userId,
      quantity: request.quantity,
      cart_id: request.cart_id,
      is_selected: request.is_selected,
    }),
  });

  dispatchCartStateChange();
  return payload;
}

export async function removeCartItem(cartId: number) {
  if (!Number.isFinite(cartId) || cartId <= 0) {
    throw new Error("Item keranjang yang dipilih tidak valid.");
  }

  const payload = await fetchAuth<RemoveCartResponse>(`/carts/remove?cart_id=${cartId}`, {
    method: "DELETE",
  });

  dispatchCartStateChange();
  return payload;
}
