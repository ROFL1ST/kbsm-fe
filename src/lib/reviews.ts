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

export async function fetchReviews(): Promise<Review[]> {
  if (!BASE_URL) throw new Error("KBBU_API belum dikonfigurasi.");
  const res = await fetch(`${BASE_URL}/reviews`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  const json: ReviewsResponse = await res.json();
  return json.data;
}
