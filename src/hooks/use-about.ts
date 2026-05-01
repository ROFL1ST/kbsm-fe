import { useEffect, useState, useCallback } from "react";
import { fetchAboutContent } from "@/lib/about";
import type { AboutPageContent } from "@/types/about";

type UseAboutReturn = {
  content: AboutPageContent | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useAbout(): UseAboutReturn {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    fetchAboutContent()
      .then((data) => {
        if (cancelled) return;
        setContent(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Gagal memuat konten halaman About."
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { content, isLoading, error, refetch };
}
