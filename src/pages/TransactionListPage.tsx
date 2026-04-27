import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PackageSearch, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TransactionCard } from "@/components/transaction/TransactionCard";
import { TransactionSkeleton } from "@/components/transaction/TransactionSkeleton";
import { useTransactions } from "@/hooks/use-transactions";
import { getAuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { ProgressTypeCode } from "@/lib/transactions";
import { PROGRESS_LABELS } from "@/lib/transactions";

const FILTER_OPTIONS: { value: ProgressTypeCode | "ALL"; label: string }[] = [
  { value: "ALL",       label: "Semua" },
  { value: "FOLLOW_UP", label: PROGRESS_LABELS.FOLLOW_UP },
  { value: "PACKING",   label: PROGRESS_LABELS.PACKING },
  { value: "SENDING",   label: PROGRESS_LABELS.SENDING },
  { value: "DONE",      label: PROGRESS_LABELS.DONE },
  { value: "REJECTED",  label: PROGRESS_LABELS.REJECTED },
];

export default function TransactionListPage() {
  const [activeFilter, setActiveFilter] = useState<ProgressTypeCode | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const user = getAuthUser();

  useEffect(() => {
    document.title = "Pesanan Saya — Kasta Beau\u00e9";
  }, []);

  // Scroll to content top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const progressFilter: ProgressTypeCode | null =
    activeFilter === "ALL" ? null : activeFilter;

  const { transactions: rawTransactions, meta, isLoading, error } = useTransactions({
    user_id: user?.id ?? null,
    progress_type_code: progressFilter,
    page,
    limit: 10,
  });

  const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];
  const totalPages   = meta ? Math.ceil(meta.total / meta.size) : 0;

  function handleFilterChange(value: ProgressTypeCode | "ALL") {
    setActiveFilter(value);
    setPage(1);
  }

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }

  /* Build page number array with ellipsis */
  function buildPages(): (number | "...")[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3)               return [1, 2, 3, "...", totalPages];
    if (page >= totalPages - 2)  return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  const activeLabel =
    FILTER_OPTIONS.find((f) => f.value === activeFilter)?.label ?? "Semua";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-luxury pb-14 pt-36 md:pb-16 md:pt-44">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="container relative">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">My Orders</p>
            <h1 className="font-display text-4xl leading-tight text-balance md:text-5xl lg:text-6xl">
              Pesanan <em className="italic gradient-text">Saya</em>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Lacak dan kelola semua pesananmu di satu tempat.
            </p>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-12 md:py-16">
        <div className="container">

          {!user ? (
            <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-14 text-center soft-shadow md:px-12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PackageSearch className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Kamu belum login</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Silakan login terlebih dahulu untuk melihat riwayat pesananmu.
              </p>
              <Button asChild className="mt-6 h-12 rounded-full px-8">
                <Link to="/login">Login sekarang</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Top bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Lanjut belanja
                </Link>
                <span className="rounded-full border border-border/60 bg-white px-4 py-2 text-sm text-muted-foreground">
                  {isLoading
                    ? "Memuat pesanan..."
                    : meta
                    ? `${meta.total} pesanan ditemukan`
                    : `${transactions.length} pesanan`}
                </span>
              </div>

              {/* Pill filter */}
              <ScrollArea className="w-full">
                <div className="flex w-max space-x-2 pb-3">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange(opt.value)}
                      className={cn(
                        "min-h-[44px] rounded-full px-5 py-2.5 text-sm font-medium transition-colors shadow-sm whitespace-nowrap",
                        activeFilter === opt.value
                          ? "bg-foreground text-background"
                          : "bg-white border border-border/60 text-foreground hover:bg-accent active:bg-accent"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* List / States */}
              {isLoading ? (
                <TransactionSkeleton />
              ) : error ? (
                <div className="rounded-[2rem] border border-border/60 bg-white p-8 text-center soft-shadow">
                  <PackageSearch className="mx-auto mb-4 h-10 w-10 text-destructive/40" />
                  <h3 className="font-semibold text-foreground">Gagal memuat pesanan</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-14 text-center soft-shadow md:px-12">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PackageSearch className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">Belum ada pesanan</h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    {activeFilter === "ALL"
                      ? "Kamu belum pernah melakukan pembelian."
                      : `Tidak ada pesanan dengan status "${activeLabel}".`}
                  </p>
                  {activeFilter !== "ALL" && (
                    <button
                      onClick={() => handleFilterChange("ALL")}
                      className="mt-6 min-h-[44px] px-6 text-sm font-medium text-primary hover:underline"
                    >
                      Lihat semua pesanan
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((trx) => (
                    <TransactionCard key={trx.id} transaction={trx} />
                  ))}
                </div>
              )}

              {/* ── Pagination ── */}
              {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">

                  {/* Prev */}
                  <button
                    onClick={() => goTo(page - 1)}
                    disabled={page === 1}
                    aria-label="Halaman sebelumnya"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors",
                      page === 1
                        ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
                        : "border-border bg-white text-foreground hover:bg-accent hover:border-primary/30 soft-shadow"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page numbers */}
                  {buildPages().map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="flex h-10 w-10 items-center justify-center text-sm text-muted-foreground select-none"
                      >
                        &hellip;
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goTo(p as number)}
                        aria-label={`Halaman ${p}`}
                        aria-current={p === page ? "page" : undefined}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-all",
                          p === page
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-white text-foreground hover:bg-accent hover:border-primary/30 soft-shadow"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => goTo(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Halaman berikutnya"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors",
                      page === totalPages
                        ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
                        : "border-border bg-white text-foreground hover:bg-accent hover:border-primary/30 soft-shadow"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                </div>
              )}

            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
