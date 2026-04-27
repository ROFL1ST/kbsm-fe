import { fetchAuth, getApiBaseUrl, getAuthToken } from "@/lib/auth";
import type { ApiEnvelope } from "@/lib/auth";

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

  const envelope = await fetchAuth<TransactionListResponse>(
    `/transactions?${query.toString()}`
  );

  if (!envelope.data) {
    throw new Error(envelope.message || "Gagal mengambil data transaksi.");
  }

  return envelope.data;
}
