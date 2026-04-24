const API_BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

const CATEGORY_CACHE_TTL = 1000 * 60 * 30;

type CategoriesApiResponse = {
  status: boolean;
  message: string;
  data: Category[];
  error: string | null;
};

export type Category = {
  id: number;
  name: string;
  path: string;
  type: number;
  created_at: string;
  updated_at: string | null;
};

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("KBBU_API belum dikonfigurasi.");
  }

  return API_BASE_URL;
}

export async function fetchCategories() {
  const response = await fetch(`${getApiBaseUrl()}/categories`);
  const payload = (await response.json()) as CategoriesApiResponse;

  if (!response.ok || !payload.status || !Array.isArray(payload.data)) {
    throw new Error(payload.error || payload.message || "Gagal mengambil kategori.");
  }

  return payload.data;
}

export { CATEGORY_CACHE_TTL };
