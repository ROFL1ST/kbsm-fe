import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ShoppingBag, CalendarDays, ChevronRight, BadgeCheck, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction, ProgressTypeCode } from "@/lib/transactions";

const PROGRESS_STYLE: Record<
  ProgressTypeCode,
  { pill: string; icon: string; bar: string }
> = {
  REJECTED: {
    pill: "bg-red-50 text-red-600 border border-red-200",
    icon: "bg-red-100 text-red-600",
    bar: "bg-red-400",
  },
  FOLLOW_UP: {
    pill: "bg-amber-50 text-amber-600 border border-amber-200",
    icon: "bg-amber-100 text-amber-600",
    bar: "bg-amber-400",
  },
  PACKING: {
    pill: "bg-blue-50 text-blue-600 border border-blue-200",
    icon: "bg-blue-100 text-blue-600",
    bar: "bg-blue-400",
  },
  SENDING: {
    pill: "bg-violet-50 text-violet-600 border border-violet-200",
    icon: "bg-violet-100 text-violet-600",
    bar: "bg-violet-400",
  },
  DONE: {
    pill: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    icon: "bg-emerald-100 text-emerald-600",
    bar: "bg-emerald-400",
  },
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border border-amber-200",
  PAID: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border border-red-200",
};

// Progress step order for the visual stepper
const PROGRESS_STEPS: ProgressTypeCode[] = [
  "FOLLOW_UP",
  "PACKING",
  "SENDING",
  "DONE",
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  transaction: Transaction;
};

export function TransactionCard({ transaction }: Props) {
  const progressStyle =
    PROGRESS_STYLE[transaction.progress_type_code] ?? PROGRESS_STYLE["FOLLOW_UP"];
  const statusStyle =
    STATUS_STYLE[transaction.status_trx_code] ?? STATUS_STYLE["PENDING"];

  const formattedDate = format(
    new Date(transaction.created_at),
    "dd MMM yyyy · HH:mm",
    { locale: idLocale }
  );

  const orderCode =
    transaction.purchase_order_client_code ||
    `TRX-${transaction.id.slice(0, 8).toUpperCase()}`;

  const isRejected = transaction.progress_type_code === "REJECTED";
  const currentStepIdx = PROGRESS_STEPS.indexOf(transaction.progress_type_code);

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-border/60 bg-white soft-shadow transition-shadow duration-200 hover:shadow-md">
      {/* Coloured top bar */}
      <div className={cn("h-1 w-full", progressStyle.bar)} />

      <div className="p-5 md:p-6">
        {/* ── Row 1: icon + order code + progress badge ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                progressStyle.icon
              )}
            >
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                No. Pesanan
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {orderCode}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0",
              progressStyle.pill
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", progressStyle.bar)} />
            {transaction.progress}
          </span>
        </div>

        {/* ── Progress stepper (hidden for REJECTED) ── */}
        {!isRejected && (
          <div className="mt-5 flex items-center gap-1">
            {PROGRESS_STEPS.map((step, i) => {
              const reached = i <= currentStepIdx;
              return (
                <div key={step} className="flex flex-1 items-center gap-1">
                  <div
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      reached ? progressStyle.bar : "bg-border"
                    )}
                  />
                  {i === PROGRESS_STEPS.length - 1 && (
                    <BadgeCheck
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        reached ? "text-emerald-500" : "text-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Divider ── */}
        <div className="my-4 h-px bg-border/60" />

        {/* ── Row 2: status pill + total + chevron ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                statusStyle
              )}
            >
              <Banknote className="h-3.5 w-3.5" />
              {transaction.status_trx}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Total</p>
              <p className="text-base font-semibold text-foreground">
                {formatRupiah(transaction.final_total)}
              </p>
            </div>
            <ChevronRight
              className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </div>
        </div>

        {/* ── Row 3: date ── */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {formattedDate}
        </div>
      </div>
    </article>
  );
}
