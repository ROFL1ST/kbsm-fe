import type { Bank, BankListApiResponse } from "@/types/bank";

const API_BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("KBBU_API belum dikonfigurasi.");
  }
  return API_BASE_URL;
}

export async function fetchBanks(page = 1, size = 10): Promise<Bank[]> {
  const response = await fetch(
    `${getApiBaseUrl()}/banks?page=${page}&size=${size}`,
  );
  const payload = (await response.json()) as BankListApiResponse;

  if (!response.ok || !payload.status) {
    throw new Error(payload.messages || "Gagal mengambil data bank.");
  }

  return payload.data.data;
}
