import { Badge } from "@/components/ui/badge";
import type { TransactionDetailData } from "@/types/transaction";

interface Props {
  transaction: TransactionDetailData;
}

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TransactionSummaryCard({ transaction }: Props) {
  const hasPaid =
    transaction.transaction_proof !== null &&
    transaction.status_trx_code !== "CANCELLED";

  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            Invoice
          </p>
          <h1 className="font-display text-3xl md:text-4xl">
            {transaction.purchase_order_client_code}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(transaction.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={hasPaid ? "secondary" : "destructive"}
            className="rounded-full px-3 py-1 text-xs"
          >
            {transaction.status_trx}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-xs"
          >
            {transaction.progress}
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Kurir</p>
          <p className="text-sm font-medium">
            {transaction.shippings.delivery}
          </p>
          <p className="text-xs text-muted-foreground">
            {transaction.shippings.service} · {transaction.shippings.description}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">No. Resi</p>
          <p className="text-sm font-medium">
            {transaction.shippings.resi ?? "Belum tersedia"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Ongkos Kirim</p>
          <p className="text-sm font-medium">
            {formatRupiah(transaction.shippings.ongkir)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Pesanan</p>
          <p className="text-sm font-semibold text-primary">
            {formatRupiah(transaction.final_total)}
          </p>
        </div>
      </div>
    </div>
  );
}
