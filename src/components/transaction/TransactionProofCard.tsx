import { ExternalLink } from "lucide-react";
import type { TransactionProof } from "@/types/transaction";

interface Props {
  proof: TransactionProof;
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

export default function TransactionProofCard({ proof }: Props) {
  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-4">
      <h2 className="font-display text-2xl">Bukti Pembayaran</h2>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted">
        <img
          src={proof.path}
          alt="Bukti pembayaran"
          width={480}
          height={320}
          loading="lazy"
          className="w-full object-cover"
        />
      </div>

      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Metode Pembayaran</span>
          <span className="font-medium">{proof.payment_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Jumlah</span>
          <span className="font-medium">
            Rp {proof.price.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Diunggah</span>
          <span className="font-medium">{formatDate(proof.updated_at)}</span>
        </div>
      </div>

      <a
        href={proof.path}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        Lihat foto penuh
      </a>
    </div>
  );
}
