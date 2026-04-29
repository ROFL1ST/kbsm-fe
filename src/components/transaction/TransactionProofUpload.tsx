import { useState } from "react";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  transactionId: string;
  isUploading: boolean;
  isSuccess: boolean;
  error: string | null;
  onSubmit: (file: File) => void;
}

export default function TransactionProofUpload({
  isUploading,
  isSuccess,
  error,
  onSubmit,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-[2rem] border border-border/60 bg-white px-5 py-10 soft-shadow flex flex-col items-center gap-3 text-center">
        <CheckCircle className="h-10 w-10 text-primary" />
        <p className="font-semibold text-sm sm:text-base">
          Bukti pembayaran berhasil diunggah!
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Tim kami sedang melakukan verifikasi.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-4 py-6 soft-shadow sm:px-6 sm:py-8 md:px-8 space-y-4">
      <div>
        <h2 className="font-display text-xl sm:text-2xl">Upload Bukti Pembayaran</h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Upload foto/screenshot bukti transfer agar pesananmu segera diverifikasi.
        </p>
      </div>

      {/* Drop zone — min height yang cukup agar mudah di-tap */}
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/70 px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 active:bg-primary/5 min-h-[120px]">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mb-3 max-h-36 w-full rounded-xl object-contain"
          />
        ) : (
          <Upload className="mb-3 h-6 w-6 text-primary" />
        )}
        <span className="text-xs sm:text-sm font-medium break-all line-clamp-1 max-w-[200px]">
          {file ? file.name : "Pilih file bukti pembayaran"}
        </span>
        <span className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
          JPG, PNG, atau PDF · Maks. 5MB
        </span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2 text-xs sm:text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="button"
        disabled={!file || isUploading}
        onClick={() => file && onSubmit(file)}
        className="w-full rounded-full h-11 text-sm"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengupload...
          </>
        ) : (
          "Upload Bukti"
        )}
      </Button>
    </div>
  );
}
