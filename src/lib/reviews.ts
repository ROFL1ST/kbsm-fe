const BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

export interface Review {
  id: number;
  name: string;
  role: string;
  review: string;
  rating: number;
  image: string;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

interface ReviewsResponse {
  status: boolean;
  message: string;
  data: Review[];
  error: string | null;
}

export interface FetchReviewsOptions {
  page?: number;
  perPage?: number;
}

export interface ReviewsPage {
  reviews: Review[];
  /** true kalau API masih punya data di halaman berikutnya */
  hasMore: boolean;
  nextPage: number;
}

/**
 * Fetch reviews dengan pagination.
 * API endpoint: GET /reviews?page=1&per_page=10
 *
 * hasMore = true  kalau jumlah data yang dikembalikan == perPage
 * (asumsi standar: kalau data < perPage berarti sudah halaman terakhir)
 */
export async function fetchReviews(
  { page = 1, perPage = 10 }: FetchReviewsOptions = {}
): Promise<ReviewsPage> {
  if (!BASE_URL) throw new Error("KBBU_API belum dikonfigurasi.");

  const url = `${BASE_URL}/reviews?page=${page}&per_page=${perPage}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch reviews");

  const json: ReviewsResponse = await res.json();
  const reviews = json.data ?? [];

  return {
    reviews,
    hasMore: reviews.length === perPage,
    nextPage: page + 1,
  };
}
