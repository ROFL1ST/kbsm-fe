import { useState } from "react";
import { Copy, Check, Landmark } from "lucide-react";
import type { TransactionBank } from "@/types/transaction";

interface Props {
  banks: TransactionBank[];
  subtotal: number;
  ongkir: number;
  finalTotal: number;
}

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function TransactionBankCard({ banks, subtotal, ongkir, finalTotal }: Props) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  function handleCopy(bank: TransactionBank) {
    navigator.clipboard.writeText(bank.account_number).then(() => {
      setCopiedId(bank.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-4 py-6 soft-shadow md:px-8 md:py-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Landmark className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl leading-none md:text-2xl">
            Tujuan Transfer
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Pilih salah satu rekening berikut
          </p>
        </div>
      </div>

      {/* Bank list */}
      <ul className="space-y-2.5">
        {banks.map((bank) => (
          <li
            key={bank.id}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-3 py-3 md:px-5 md:py-4"
          >
            {/* Logo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-white p-1 md:h-12 md:w-12">
              <img
                src={bank.logo}
                alt={bank.name}
                width={40}
                height={40}
                loading="lazy"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {bank.name}
              </p>
              <p className="font-mono text-sm font-bold tracking-wider text-foreground md:text-base">
                {bank.account_number}
              </p>
              <p className="text-[11px] text-muted-foreground">
                a.n.{" "}
                <span className="font-medium text-foreground">
                  {bank.account_name}
                </span>
              </p>
            </div>

            {/* Copy button */}
            <button
              type="button"
              aria-label={`Salin nomor rekening ${bank.name}`}
              onClick={() => handleCopy(bank)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {copiedId === bank.id ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Payment breakdown */}
      <div className="space-y-2 rounded-2xl border border-border/60 bg-background/60 px-4 py-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Subtotal produk</span>
          <span className="font-medium">{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Ongkos kirim</span>
          <span className="font-medium">{formatRupiah(ongkir)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-2">
          <span className="font-semibold text-foreground">Total pembayaran</span>
          <span className="text-base font-bold text-primary">{formatRupiah(finalTotal)}</span>
        </div>
      </div>

      {/* Footer note */}
      <p className="rounded-2xl bg-primary/5 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground md:px-4 md:py-3 md:text-xs">
        Setelah transfer, segera upload bukti pembayaran di bawah agar
        pesanan dapat segera diproses.
      </p>
    </div>
  );
}
