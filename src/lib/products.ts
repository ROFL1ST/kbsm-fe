const API_BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

const PRODUCT_CACHE_TTL = 1000 * 60 * 5;

type ProductsApiResponse = {
  status: boolean;
  message: string;
  data: ProductApiItem[];
  error: string | null;
};

type FetchProductsOptions = {
  categoryId?: number;
  status?: number;
};

export type ProductApiItem = {
  product_id: number;
  product_detail_id: number;
  category_id: number;
  category_name: string;
  product_unit_id: number;
  product_name: string;
  product_description: string;
  code: string;
  total_quantity: number;
  unit_code: string;
  price: number;
  discount_flag: boolean;
  discount_amount: number;
  final_price: number;
  is_best_seller: boolean;
  path: string;
};

export type ProductCardData = {
  id: number;
  productId: number;
  categoryId: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
};

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("KBBU_API belum dikonfigurasi.");
  }

  return API_BASE_URL;
}

export async function fetchProducts(options: FetchProductsOptions = {}) {
  const query = new URLSearchParams();

  if (typeof options.categoryId === "number" && Number.isFinite(options.categoryId)) {
    query.set("category_id", String(options.categoryId));
  }

  if (typeof options.status === "number" && Number.isFinite(options.status)) {
    query.set("status", String(options.status));
  }

  const endpoint = query.size > 0
    ? `${getApiBaseUrl()}/products?${query.toString()}`
    : `${getApiBaseUrl()}/products`;
  const response = await fetch(endpoint);
  const payload = (await response.json()) as ProductsApiResponse;

  if (!response.ok || !payload.status || !Array.isArray(payload.data)) {
    throw new Error(payload.error || payload.message || "Gagal mengambil produk.");
  }

  return payload.data;
}

export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export function mapProductToCard(product: ProductApiItem): ProductCardData {
  const hasDiscount = product.discount_flag && product.discount_amount > 0;
  const oldPrice = hasDiscount ? product.price : undefined;
  const price = hasDiscount ? product.final_price : product.price;
  const discountPercentage =
    hasDiscount && product.price > 0
      ? Math.round((product.discount_amount / product.price) * 100)
      : 0;

  return {
    id: product.product_detail_id,
    productId: product.product_id,
    categoryId: product.category_id,
    name: product.product_name,
    category: product.category_name,
    price,
    oldPrice,
    rating: 5,
    reviews: product.total_quantity,
    image: product.path,
    badge: product.is_best_seller
      ? "Best Seller"
      : discountPercentage > 0
        ? `-${discountPercentage}%`
        : undefined,
  };
}

export { PRODUCT_CACHE_TTL };
