import { fetchAuth } from "@/lib/auth";

export type ProgressTypeCode =
  | "REJECTED"
  | "FOLLOW_UP"
  | "PACKING"
  | "SENDING"
  | "DONE";

export const PROGRESS_LABELS: Record<ProgressTypeCode, string> = {
  REJECTED: "Ditolak",
  FOLLOW_UP: "Butuh Bantuan",
  PACKING: "Sedang Dikemas",
  SENDING: "Sedang Dikirim",
  DONE: "Selesai",
};

export type Transaction = {
  id: string;
  user_id: string;
  progress_type_code: ProgressTypeCode;
  status_trx_code: string;
  progress: string;
  status_trx: string;
  purchase_order_client_code: string;
  final_total: number;
  created_at: string;
};

export type TransactionMeta = {
  page: number;
  size: number;
  total: number;
};

// Shape of the actual API envelope:
// { status, message, data: Transaction[], meta: TransactionMeta, error }
type TransactionApiEnvelope = {
  status: boolean;
  message: string;
  data: Transaction[] | null;
  meta: TransactionMeta | null;
  error: string | null;
};

export type TransactionListResponse = {
  data: Transaction[];
  meta: TransactionMeta;
};

export type TransactionParams = {
  user_id: string;
  page?: number;
  limit?: number;
  progress_type_code?: ProgressTypeCode | null;
};

export async function getTransactions(
  params: TransactionParams
): Promise<TransactionListResponse> {
  const query = new URLSearchParams();
  query.set("user_id", params.user_id);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 10));
  if (params.progress_type_code) {
    query.set("progress_type_code", params.progress_type_code);
  }

  // fetchAuth wraps the raw response — cast to the real envelope shape
  const envelope = await fetchAuth<TransactionApiEnvelope>(
    `/transactions?${query.toString()}`
  );

  // The API puts data & meta at root envelope level (not nested)
  const raw = envelope as unknown as TransactionApiEnvelope;

  if (!raw.status) {
    throw new Error(raw.message || "Gagal mengambil data transaksi.");
  }

  return {
    data: Array.isArray(raw.data) ? raw.data : [],
    meta: raw.meta ?? { page: 1, size: 10, total: 0 },
  };
}
