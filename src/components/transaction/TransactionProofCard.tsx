import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Pencil,
  Upload,
  Loader2,
  X,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { TransactionProof } from "@/types/transaction";

interface Props {
  proof: TransactionProof;
  /** Dipanggil ketika user memilih file baru dan klik "Simpan". Hanya tersedia jika belum diverifikasi. */
  onUpdate?: (file: File) => Promise<void>;
  isUpdating?: boolean;
}

function formatDate(iso: string) {
  return format(new Date(iso), "dd MMM yyyy · HH:mm", {
    locale: idLocale,
  });
}

const PAYMENT_LABEL: Record<string, string> = {
  TRANSFER: "Transfer Bank",
};

/** Pembayaran ditolak jika ada finance_callback_at DAN finance_callback_reason tidak kosong */
function isRejected(proof: TransactionProof): boolean {
  return (
    proof.finance_callback_at !== null &&
    proof.finance_callback_reason !== null &&
    proof.finance_callback_reason.trim() !== ""
  );
}

/** Pembayaran terverifikasi jika ada finance_callback_at DAN tidak ada alasan penolakan */
function isVerified(proof: TransactionProof): boolean {
  return (
    proof.finance_callback_at !== null &&
    (proof.finance_callback_reason === null ||
      proof.finance_callback_reason.trim() === "")
  );
}

export default function TransactionProofCard({
  proof,
  onUpdate,
  isUpdating = false,
}: Props) {
  const hasProof = proof.path !== null;
  const rejected = isRejected(proof);
  const verified = isVerified(proof);

  const canUpdate = hasProof && !verified && !!onUpdate;

  const [isEditMode, setIsEditMode] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setNewFile(selected);
    setUpdateError(null);
    if (selected && selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  }

  function handleCancel() {
    setIsEditMode(false);
    setNewFile(null);
    setPreview(null);
    setUpdateError(null);
  }

  async function handleSubmit() {
    if (!newFile || !onUpdate) return;
    setUpdateError(null);
    try {
      await onUpdate(newFile);
      setIsEditMode(false);
      setNewFile(null);
      setPreview(null);
    } catch (err: unknown) {
      setUpdateError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui bukti pembayaran.",
      );
    }
  }

  /* ---------- badge status ---------- */
  function StatusBadge() {
    if (!hasProof) return null;

    if (verified) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-primary/30 bg-primary/10 text-primary"
        >
          <CheckCircle2 className="h-3 w-3" />
          Terverifikasi
        </Badge>
      );
    }

    if (rejected) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-destructive/30 bg-destructive/10 text-destructive"
        >
          <XCircle className="h-3 w-3" />
          Ditolak
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="gap-1.5">
        <Clock className="h-3 w-3" />
        Menunggu Verifikasi
      </Badge>
    );
  }

  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-2xl">Bukti Pembayaran</h2>
        <StatusBadge />
      </div>

      {/* Banner alasan penolakan — pakai shadcn Alert */}
      {rejected && proof.finance_callback_reason && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pembayaran Ditolak</AlertTitle>
          <AlertDescription className="space-y-1.5">
            <p>{proof.finance_callback_reason}</p>
            {canUpdate && (
              <p className="text-destructive/70">
                Silakan periksa kembali jumlah transfer dan foto bukti
                pembayaran, lalu unggah ulang.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Mode edit — file picker baru */}
      {isEditMode ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Pilih file baru untuk mengganti bukti yang sudah diunggah
            sebelumnya.
          </p>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/70 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
            {preview ? (
              <img
                src={preview}
                alt="Preview baru"
                className="mb-3 max-h-40 rounded-xl object-contain"
              />
            ) : (
              <Upload className="mb-3 h-6 w-6 text-primary" />
            )}
            <span className="text-sm font-medium">
              {newFile ? newFile.name : "Pilih file pengganti"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, atau PDF · Maks. 5MB
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {updateError && (
            <Alert variant="destructive" className="rounded-xl py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{updateError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1 rounded-full"
              disabled={!newFile || isUpdating}
              onClick={handleSubmit}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Bukti Baru"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-4"
              disabled={isUpdating}
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* Mode normal — tampilkan gambar bukti */
        <>
          {hasProof ? (
            <div
              className={`overflow-hidden rounded-2xl border bg-muted ${
                rejected
                  ? "border-destructive/40 opacity-60"
                  : "border-border/60"
              }`}
            >
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
        </>
      )}

      <Separator />

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
        {verified && proof.finance_callback_at && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diverifikasi</span>
            <span className="font-medium">
              {formatDate(proof.finance_callback_at)}
            </span>
          </div>
        )}
        {rejected && proof.finance_callback_at && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ditolak pada</span>
            <span className="font-medium text-destructive">
              {formatDate(proof.finance_callback_at)}
            </span>
          </div>
        )}
      </div>

      {/* Actions bawah */}
      <div className="flex items-center justify-between gap-3">
        {hasProof && !isEditMode && (
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

        {canUpdate && !isEditMode && (
          <Button
            type="button"
            variant={rejected ? "destructive" : "outline"}
            size="sm"
            className="ml-auto rounded-full gap-1.5"
            onClick={() => setIsEditMode(true)}
          >
            {rejected ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Unggah Ulang Bukti
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Ganti Bukti
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
