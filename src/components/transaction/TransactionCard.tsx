import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ShoppingBag, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Transaction, ProgressTypeCode } from "@/lib/transactions";

const PROGRESS_VARIANT: Record<
  ProgressTypeCode,
  { bg: string; text: string; dot: string }
> = {
  REJECTED: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  FOLLOW_UP: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600",
    dot: "bg-yellow-500",
  },
  PACKING: {
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    dot: "bg-blue-500",
  },
  SENDING: {
    bg: "bg-primary/10",
    text: "text-primary",
    dot: "bg-primary",
  },
  DONE: {
    bg: "bg-green-500/10",
    text: "text-green-600",
    dot: "bg-green-500",
  },
};

const STATUS_VARIANT: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600",
  PAID: "bg-green-500/10 text-green-600",
  CANCELLED: "bg-destructive/10 text-destructive",
};

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
    PROGRESS_VARIANT[transaction.progress_type_code] ??
    PROGRESS_VARIANT["FOLLOW_UP"];
  const statusStyle =
    STATUS_VARIANT[transaction.status_trx_code] ?? STATUS_VARIANT["PENDING"];

  const createdDate = new Date(transaction.created_at);
  const formattedDate = format(createdDate, "dd MMM yyyy, HH:mm", {
    locale: idLocale,
  });

  const orderCode =
    transaction.purchase_order_client_code || `TRX-${transaction.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="glass-card p-5 flex flex-col gap-3.5 hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      {/* Top row: order code + progress badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
              No. Pesanan
            </p>
            <p className="text-sm font-medium truncate text-foreground">
              {orderCode}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0",
            progressStyle.bg,
            progressStyle.text
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", progressStyle.dot)}
          />
          {transaction.progress}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Bottom row: status + total + date */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
              statusStyle
            )}
          >
            {transaction.status_trx}
          </span>
        </div>

        <p className="font-semibold text-sm text-foreground">
          {formatRupiah(transaction.final_total)}
        </p>
      </div>

      {/* Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formattedDate}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}
