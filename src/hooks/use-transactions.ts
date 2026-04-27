import { useEffect, useState, useCallback } from "react";
import {
  getTransactions,
  type Transaction,
  type TransactionMeta,
  type ProgressTypeCode,
} from "@/lib/transactions";

type UseTransactionsParams = {
  user_id: string | null;
  progress_type_code: ProgressTypeCode | null;
  page: number;
  limit?: number;
};

type UseTransactionsReturn = {
  transactions: Transaction[];
  meta: TransactionMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useTransactions({
  user_id,
  progress_type_code,
  page,
  limit = 10,
}: UseTransactionsParams): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<TransactionMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!user_id) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getTransactions({ user_id, page, limit, progress_type_code })
      .then((res) => {
        if (cancelled) return;
        // Guard: API might return undefined/null for data array
        setTransactions(Array.isArray(res.data) ? res.data : []);
        setMeta(res.meta ?? null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setTransactions([]);
        setError(
          err instanceof Error ? err.message : "Gagal memuat transaksi."
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user_id, progress_type_code, page, limit, tick]);

  return { transactions, meta, isLoading, error, refetch };
}
