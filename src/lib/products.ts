const API_BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

const PRODUCT_CACHE_TTL = 1000 * 60 * 5;

type ProductsApiResponse = {
  status: boolean;
  message: string;
  data: ProductApiItem[];
  error: string | null;
};

type ProductDetailApiResponse = {
  status: boolean;
  message: string;
  data: ProductApiItem;
  error: string | null;
};

type FetchProductsOptions = {
  search?: string;
  categoryId?: number | string;
  productUnitId?: number;
  size?: number;
  page?: number;
  status?: number | string;
};

export type CategoryApiItem = {
  id: number;
  name: string;
  path: string;
  type: number;
  created_at: string;
  updated_at: string | null;
};

type CategoriesApiResponse = {
  status: boolean;
  message: string;
  data: CategoryApiItem[];
  error: string | null;
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
  path: string | string[];
  valid_until?: string;
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

export function getProductImages(product: ProductApiItem) {
  if (Array.isArray(product.path)) {
    const images = product.path.filter(
      (image): image is string => typeof image === "string" && image.trim().length > 0,
    );

    return images.length > 0 ? images : [""];
  }

  return typeof product.path === "string" && product.path.trim().length > 0
    ? [product.path]
    : [""];
}

export async function fetchProducts(options: FetchProductsOptions = {}) {
  const query = new URLSearchParams();

  if (options.search) {
    query.set("search", options.search);
  }

  if (options.categoryId !== undefined && options.categoryId !== "") {
    query.set("category_id", String(options.categoryId));
  }

  if (typeof options.productUnitId === "number" && Number.isFinite(options.productUnitId)) {
    query.set("product_unit_id", String(options.productUnitId));
  }

  if (options.status !== undefined && options.status !== "") {
    query.set("status", String(options.status));
  }

  if (typeof options.size === "number" && Number.isFinite(options.size)) {
    query.set("size", String(options.size));
  }

  if (typeof options.page === "number" && Number.isFinite(options.page)) {
    query.set("page", String(options.page));
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

export async function fetchProductDetail(productUnitId: number) {
  const endpoint = `${getApiBaseUrl()}/products/detail?product_unit_id=${productUnitId}`;
  const response = await fetch(endpoint);
  const payload = (await response.json()) as ProductDetailApiResponse;

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(payload.error || payload.message || "Gagal mengambil detail produk.");
  }

  return payload.data;
}

export async function fetchCategories() {
  const endpoint = `${getApiBaseUrl()}/categories`;
  const response = await fetch(endpoint);
  const payload = (await response.json()) as CategoriesApiResponse;

  if (!response.ok || !payload.status || !Array.isArray(payload.data)) {
    throw new Error(payload.error || payload.message || "Gagal mengambil kategori.");
  }

  return payload.data;
}

export async function fetchDiscounts() {
  const endpoint = `${getApiBaseUrl()}/products/discount`;
  const response = await fetch(endpoint);
  const payload = (await response.json()) as ProductsApiResponse;

  if (!response.ok || !payload.status || !Array.isArray(payload.data)) {
    throw new Error(payload.error || payload.message || "Gagal mengambil data diskon.");
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
    id: product.product_unit_id,
    productId: product.product_id,
    categoryId: product.category_id,
    name: product.product_name,
    category: product.category_name,
    price,
    oldPrice,
    rating: 5,
    reviews: product.total_quantity,
    image: getProductImages(product)[0] ?? "",
    badge: product.is_best_seller
      ? "Best Seller"
      : discountPercentage > 0
        ? `-${discountPercentage}%`
        : undefined,
  };
}

export function mapProductToDiscount(product: ProductApiItem) {
  const discountPercentage =
    product.price > 0
      ? Math.round((product.discount_amount / product.price) * 100)
      : 0;

  // Fallback valid_until: 7 hari dari sekarang jika API tidak mengembalikannya
  const fallbackUntil = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    product_id: product.product_id,
    product_detail_id: product.product_detail_id,
    product_unit_id: product.product_unit_id,
    name: product.product_name,
    category: product.category_name,
    image: getProductImages(product)[0] ?? "",
    original_price: product.price,
    discount_percentage: discountPercentage,
    final_price: product.final_price,
    valid_until: product.valid_until ?? fallbackUntil,
  };
}

export { PRODUCT_CACHE_TTL };
