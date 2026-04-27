import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ShoppingBag, CalendarDays, ChevronRight, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction, ProgressTypeCode } from "@/lib/transactions";

/* ── Per-status styling using only theme tokens ──
   All colours stay inside the Luxury Beauty palette:
   - Active / positive  → primary (Rose Gold) family
   - In-progress        → secondary/beige family
   - Warning / pending  → accent/blush family
   - Rejected           → destructive
*/
const PROGRESS_STYLE: Record<
  ProgressTypeCode,
  { pill: string; iconWrap: string; bar: string; dot: string }
> = {
  FOLLOW_UP: {
    pill: "bg-accent text-accent-foreground border border-accent-foreground/10",
    iconWrap: "bg-accent text-accent-foreground",
    bar: "bg-accent-foreground/30",
    dot: "bg-accent-foreground/60",
  },
  PACKING: {
    pill: "bg-secondary text-secondary-foreground border border-secondary-foreground/10",
    iconWrap: "bg-secondary text-secondary-foreground",
    bar: "bg-secondary-foreground/40",
    dot: "bg-secondary-foreground/70",
  },
  SENDING: {
    pill: "bg-primary/10 text-primary border border-primary/20",
    iconWrap: "bg-primary/10 text-primary",
    bar: "bg-primary/60",
    dot: "bg-primary",
  },
  DONE: {
    pill: "bg-primary/15 text-primary border border-primary/25",
    iconWrap: "bg-primary/15 text-primary",
    bar: "bg-primary",
    dot: "bg-primary",
  },
  REJECTED: {
    pill: "bg-destructive/10 text-destructive border border-destructive/20",
    iconWrap: "bg-destructive/10 text-destructive",
    bar: "bg-destructive/60",
    dot: "bg-destructive",
  },
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-accent text-accent-foreground border border-accent-foreground/10",
  PAID:    "bg-primary/15 text-primary border border-primary/25",
  CANCELLED: "bg-destructive/10 text-destructive border border-destructive/20",
};

// Ordered steps for the progress stepper (REJECTED is shown differently)
const STEPS: { code: ProgressTypeCode; label: string }[] = [
  { code: "FOLLOW_UP", label: "Diproses" },
  { code: "PACKING",   label: "Dikemas" },
  { code: "SENDING",   label: "Dikirim" },
  { code: "DONE",      label: "Selesai" },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

type Props = { transaction: Transaction };

export function TransactionCard({ transaction }: Props) {
  const ps = PROGRESS_STYLE[transaction.progress_type_code] ?? PROGRESS_STYLE["FOLLOW_UP"];
  const ss = STATUS_STYLE[transaction.status_trx_code] ?? STATUS_STYLE["PENDING"];

  const formattedDate = format(
    new Date(transaction.created_at),
    "dd MMM yyyy \u00b7 HH:mm",
    { locale: idLocale }
  );

  const orderCode =
    transaction.purchase_order_client_code ||
    `TRX-${transaction.id.slice(0, 8).toUpperCase()}`;

  const isRejected = transaction.progress_type_code === "REJECTED";
  const currentIdx  = STEPS.findIndex((s) => s.code === transaction.progress_type_code);

  return (
    <article
      className="group relative overflow-hidden rounded-[2rem] border border-border bg-white transition-all duration-300 hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      {/* Rose-gold accent bar at top */}
      <div className={cn("h-[3px] w-full", ps.bar)} />

      <div className="p-5 md:p-6 space-y-4">

        {/* ── Row 1: icon + order code + progress badge ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center shrink-0", ps.iconWrap)}>
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                No. Pesanan
              </p>
              <p className="text-sm font-semibold text-foreground truncate font-display">
                {orderCode}
              </p>
            </div>
          </div>

          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0",
            ps.pill
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", ps.dot)} />
            {transaction.progress}
          </span>
        </div>

        {/* ── Progress stepper ── */}
        {!isRejected ? (
          <div className="flex items-end gap-2">
            {STEPS.map((step, i) => {
              const reached  = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step.code} className="flex flex-1 flex-col items-center gap-1">
                  <div className={cn(
                    "h-1 w-full rounded-full transition-colors duration-300",
                    reached ? "bg-primary" : "bg-border"
                  )} />
                  <span className={cn(
                    "text-[9px] uppercase tracking-wide hidden sm:block transition-colors",
                    isCurrent ? "text-primary font-semibold" : reached ? "text-muted-foreground" : "text-border"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/5 border border-destructive/15 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
            <p className="text-xs text-destructive">
              Pesanan ini telah ditolak. Hubungi CS untuk informasi lebih lanjut.
            </p>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="h-px bg-border/60" />

        {/* ── Row 3: status + total + chevron ── */}
        <div className="flex items-center justify-between gap-3">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
            ss
          )}>
            <Banknote className="h-3.5 w-3.5" />
            {transaction.status_trx}
          </span>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Total</p>
              <p className="text-base font-semibold text-foreground">
                {formatRupiah(transaction.final_total)}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-border group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>

        {/* ── Date ── */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-primary/50" />
          {formattedDate}
        </div>

      </div>
    </article>
  );
}
