import { fetchAuth, getApiBaseUrl, getAuthToken } from "@/lib/auth";
import type {
  TransactionDetailData,
  TransactionDetailResponse,
  UploadTransactionProofPayload,
  UploadTransactionProofResponse,
  RepeatOrderPayload,
  RepeatOrderResponse,
} from "@/types/transaction";

export async function fetchTransactionDetail(params: {
  userId: string;
  transactionId: string;
}): Promise<TransactionDetailData> {
  const query = new URLSearchParams({
    user_id: params.userId,
    transaction_id: params.transactionId,
  });

  const result = await fetchAuth<TransactionDetailData>(
    `/transaction/detail?${query}`
  );

  const raw = result as unknown as TransactionDetailResponse;

  if (!raw.status) {
    throw new Error(raw.message || "Gagal mengambil detail transaksi.");
  }

  return raw.data;
}

export async function uploadTransactionProof({
  transactionId,
  file,
}: UploadTransactionProofPayload): Promise<UploadTransactionProofResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token otentikasi tidak ditemukan. Silakan login kembali.");
  }

  const formData = new FormData();
  formData.append("transaction_id", transactionId);
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/transaction/upload-proof`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      // Jangan set Content-Type — browser otomatis isi boundary multipart/form-data
    },
    body: formData,
  });

  const payload = (await response.json()) as UploadTransactionProofResponse;

  if (!response.ok || !payload.status) {
    throw new Error(
      (payload.error as string) || payload.message || "Gagal mengunggah bukti pembayaran."
    );
  }

  return payload;
}

export async function repeatOrder({
  transactionId,
  userId,
}: RepeatOrderPayload): Promise<RepeatOrderResponse> {
  const result = await fetchAuth<RepeatOrderResponse>(
    `/transaction/repeat-order`,
    {
      method: "POST",
      body: JSON.stringify({ user_id: userId, transaction_id: transactionId }),
    }
  );

  const raw = result as unknown as RepeatOrderResponse;

  if (!raw.status) {
    throw new Error(raw.message || "Gagal melakukan repeat order.");
  }

  return raw;
}
