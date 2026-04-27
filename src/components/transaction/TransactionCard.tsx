import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarDays, ChevronRight, Banknote, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction, ProgressTypeCode } from "@/lib/transactions";

/* ── Status badge style — all using theme tokens only ── */
const PROGRESS_PILL: Record<ProgressTypeCode, string> = {
  FOLLOW_UP: "bg-accent text-accent-foreground",
  PACKING:   "bg-secondary text-secondary-foreground",
  SENDING:   "bg-primary/10 text-primary",
  DONE:      "bg-primary text-primary-foreground",
  REJECTED:  "bg-destructive/10 text-destructive",
};

const STATUS_PILL: Record<string, string> = {
  PENDING:   "bg-secondary text-secondary-foreground",
  PAID:      "bg-primary/10 text-primary",
  CANCELLED: "bg-destructive/10 text-destructive",
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

type Props = { transaction: Transaction };

export function TransactionCard({ transaction }: Props) {
  const progressPill =
    PROGRESS_PILL[transaction.progress_type_code] ?? PROGRESS_PILL["FOLLOW_UP"];
  const statusPill =
    STATUS_PILL[transaction.status_trx_code] ?? STATUS_PILL["PENDING"];

  const formattedDate = format(
    new Date(transaction.created_at),
    "dd MMM yyyy \u00b7 HH:mm",
    { locale: idLocale }
  );

  const orderCode =
    transaction.purchase_order_client_code ||
    `TRX-${transaction.id.slice(0, 8).toUpperCase()}`;

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-card soft-shadow hover-lift cursor-pointer">

      {/* Top decorative band — blush gradient like bg-gradient-nude on ProductCard image area */}
      <div className="flex items-center justify-between gap-3 bg-gradient-luxury px-5 py-4">
        {/* Icon + order code */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-primary shadow-sm">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-primary">
              No. Pesanan
            </p>
            <p className="truncate font-display text-sm font-semibold text-foreground">
              {orderCode}
            </p>
          </div>
        </div>

        {/* Progress badge */}
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em]",
            progressPill
          )}
        >
          {transaction.progress}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">

        {/* Total */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-0.5">
            Total Pembayaran
          </p>
          <p className="font-display text-2xl font-semibold text-foreground">
            {formatRupiah(transaction.final_total)}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Status + date + chevron */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium",
                statusPill
              )}
            >
              <Banknote className="h-3.5 w-3.5" />
              {transaction.status_trx}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span>{formattedDate}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
          </div>
        </div>

      </div>
    </article>
  );
}
