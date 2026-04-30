import { useState } from "react";
import { Copy, Check, Landmark } from "lucide-react";
import type { TransactionBank } from "@/types/transaction";

interface Props {
  banks: TransactionBank[];
}

export default function TransactionBankCard({ banks }: Props) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  function handleCopy(bank: TransactionBank) {
    navigator.clipboard.writeText(bank.account_number).then(() => {
      setCopiedId(bank.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Landmark className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl leading-none">Tujuan Transfer</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Lakukan pembayaran ke salah satu rekening berikut
          </p>
        </div>
      </div>

      {/* Bank list */}
      <ul className="space-y-3">
        {banks.map((bank) => (
          <li
            key={bank.id}
            className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/60 px-5 py-4"
          >
            {/* Logo */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-white p-1">
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
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {bank.name}
              </p>
              <p className="font-mono text-base font-semibold tracking-wider text-foreground">
                {bank.account_number}
              </p>
              <p className="text-xs text-muted-foreground">
                a.n. <span className="font-medium text-foreground">{bank.account_name}</span>
              </p>
            </div>

            {/* Copy button */}
            <button
              type="button"
              aria-label={`Salin nomor rekening ${bank.name}`}
              onClick={() => handleCopy(bank)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {copiedId === bank.id ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Footer note */}
      <p className="rounded-2xl bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Setelah melakukan transfer, segera upload bukti pembayaran di bawah ini
        agar pesanan dapat segera diproses.
      </p>
    </div>
  );
}
