import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { TransactionCard } from "@/components/transaction/TransactionCard";
import { TransactionSkeleton } from "@/components/transaction/TransactionSkeleton";
import { useTransactions } from "@/hooks/use-transactions";
import { getAuthUser } from "@/lib/auth";
import type { ProgressTypeCode } from "@/lib/transactions";
import { PROGRESS_LABELS } from "@/lib/transactions";

const FILTER_OPTIONS: { value: ProgressTypeCode | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "FOLLOW_UP", label: PROGRESS_LABELS.FOLLOW_UP },
  { value: "PACKING", label: PROGRESS_LABELS.PACKING },
  { value: "SENDING", label: PROGRESS_LABELS.SENDING },
  { value: "DONE", label: PROGRESS_LABELS.DONE },
  { value: "REJECTED", label: PROGRESS_LABELS.REJECTED },
];

export default function TransactionListPage() {
  const [activeFilter, setActiveFilter] = useState<ProgressTypeCode | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const user = getAuthUser();

  useEffect(() => {
    document.title = "Pesanan Saya — Kasta Beauté";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const progressFilter: ProgressTypeCode | null =
    activeFilter === "ALL" ? null : activeFilter;

  const { transactions: rawTransactions, meta, isLoading, error } = useTransactions({
    user_id: user?.id ?? null,
    progress_type_code: progressFilter,
    page,
    limit: 10,
  });

  const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];
  const totalPages = meta ? Math.ceil(meta.total / meta.size) : 0;

  function handleFilterChange(value: ProgressTypeCode | "ALL") {
    setActiveFilter(value);
    setPage(1);
  }

  function renderPagination() {
    if (totalPages <= 1) return null;
    const showEllipsis = totalPages > 5;

    let visiblePages: (number | "...")[];
    if (!showEllipsis) {
      visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (page <= 3) {
      visiblePages = [1, 2, 3, "...", totalPages];
    } else if (page >= totalPages - 2) {
      visiblePages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
    } else {
      visiblePages = [1, "...", page - 1, page, page + 1, "...", totalPages];
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {visiblePages.map((p, i) =>
            p === "..." ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p as number)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }

  const activeLabel = FILTER_OPTIONS.find((f) => f.value === activeFilter)?.label ?? "Semua";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero Header ── */}
      <section className="relative pt-36 md:pt-44 pb-12 overflow-hidden bg-gradient-luxury">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] bg-blush rounded-full blur-3xl" />

        <div className="container relative flex flex-col items-center text-center gap-3 animate-fade-up">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
            <PackageSearch className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight">
            Pesanan Saya
          </h1>
          <p className="text-sm text-muted-foreground">
            Lacak dan kelola semua pesananmu di sini
          </p>
          {meta && (
            <p className="text-xs text-muted-foreground/60">
              {meta.total} pesanan ditemukan
            </p>
          )}
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-10 md:py-14">
        <div className="container max-w-3xl">
          {!user ? (
            <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
              <PackageSearch className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="font-display text-xl">Kamu belum login</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Silakan login terlebih dahulu untuk melihat riwayat pesananmu.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ── Pill Filter ── */}
              <ScrollArea className="w-full">
                <div className="flex w-max space-x-2 pb-3">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange(opt.value)}
                      className={`min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap ${
                        activeFilter === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-white border border-border/60 text-foreground hover:bg-accent active:bg-accent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* ── Transaction List ── */}
              {isLoading ? (
                <TransactionSkeleton />
              ) : error ? (
                <div className="glass-card p-10 flex flex-col items-center gap-3 text-center">
                  <PackageSearch className="h-10 w-10 text-destructive/40" />
                  <h3 className="font-medium">Gagal memuat pesanan</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
                  <PackageSearch className="h-12 w-12 text-muted-foreground/30" />
                  <h3 className="font-display text-xl">Belum ada pesanan</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {activeFilter === "ALL"
                      ? "Kamu belum pernah melakukan pembelian."
                      : `Tidak ada pesanan dengan status "${activeLabel}".`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((trx) => (
                    <TransactionCard key={trx.id} transaction={trx} />
                  ))}
                </div>
              )}

              {/* ── Pagination ── */}
              {!isLoading && transactions.length > 0 && renderPagination()}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
