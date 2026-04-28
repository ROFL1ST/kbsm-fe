import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ExternalLink, CheckCircle2, Clock } from "lucide-react";
import type { TransactionProof } from "@/types/transaction";

interface Props {
  proof: TransactionProof;
}

function formatDate(iso: string) {
  return format(new Date(iso), "dd MMM yyyy \u00b7 HH:mm", { locale: idLocale });
}

const PAYMENT_LABEL: Record<string, string> = {
  TRANSFER: "Transfer Bank",
  CASH: "Tunai",
  COD: "Bayar di Tempat",
};

export default function TransactionProofCard({ proof }: Props) {
  /** Bukti sudah ada jika path bukan null */
  const hasProof = proof.path !== null;

  /** Verifikasi selesai jika finance_callback_at terisi */
  const isVerified = proof.finance_callback_at !== null;

  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-2xl">Bukti Pembayaran</h2>
        {hasProof && (
          <span
            className={
              isVerified
                ? "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary"
                : "inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground"
            }
          >
            {isVerified ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Terverifikasi
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                Menunggu Verifikasi
              </>
            )}
          </span>
        )}
      </div>

      {/* Gambar bukti */}
      {hasProof ? (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted">
          <img
            src={proof.path!}
            alt="Bukti pembayaran"
            width={480}
            height={320}
            loading="lazy"
            className="w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Bukti pembayaran belum diunggah
          </p>
        </div>
      )}

      {/* Info pembayaran */}
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Metode Pembayaran</span>
          <span className="font-medium">
            {PAYMENT_LABEL[proof.payment_type] ?? proof.payment_type}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Jumlah</span>
          <span className="font-medium">
            Rp {proof.price.toLocaleString("id-ID")}
          </span>
        </div>
        {hasProof && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diunggah</span>
            <span className="font-medium">{formatDate(proof.updated_at)}</span>
          </div>
        )}
        {isVerified && proof.finance_callback_at && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diverifikasi</span>
            <span className="font-medium">
              {formatDate(proof.finance_callback_at)}
            </span>
          </div>
        )}
      </div>

      {/* Link lihat penuh — hanya jika ada gambar */}
      {hasProof && (
        <a
          href={proof.path!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Lihat foto penuh
        </a>
      )}
    </div>
  );
}
