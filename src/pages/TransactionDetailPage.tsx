import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RotateCcw, Loader2 } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";

import TransactionSummaryCard from "@/components/transaction/TransactionSummaryCard";
import TransactionProgress from "@/components/transaction/TransactionProgress";
import TransactionProductsList from "@/components/transaction/TransactionProductsList";
import TransactionShippingCard from "@/components/transaction/TransactionShippingCard";
import TransactionProofCard from "@/components/transaction/TransactionProofCard";
import TransactionProofUpload from "@/components/transaction/TransactionProofUpload";
import TransactionBankCard from "@/components/transaction/TransactionBankCard";
import TransactionDetailSkeleton from "@/components/transaction/TransactionDetailSkeleton";

import {
  fetchTransactionDetail,
  repeatOrder,
  updateTransactionProgress,
  uploadTransactionProof,
} from "@/lib/transaction-detail";
import { getTransactionProgressSteps } from "@/lib/transaction-progress";
import { getAuthUser } from "@/lib/auth";
import type { TransactionDetailData, TransactionProof } from "@/types/transaction";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getAuthUser();
  const userId = user?.id ?? "";

  const [transaction, setTransaction] = useState<TransactionDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State untuk upload pertama kali
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State untuk update bukti yang sudah ada
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  const [isRepeating, setIsRepeating] = useState(false);

  useEffect(() => {
    document.title = "Detail Transaksi \u2014 Kasta Beau\u00e9";
  }, []);

  async function load() {
    if (!id || !userId) return;
    setIsLoading(true);
    setFetchError(null);

    try {
      const data = await fetchTransactionDetail({ userId, transactionId: id });
      setTransaction(data);
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error ? err.message : "Gagal memuat detail transaksi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, [id, userId]);

  /** Upload pertama kali (path masih null) */
  async function handleUpload(file: File) {
    if (!transaction) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      await uploadTransactionProof({ transactionId: transaction.id, file });
      setUploadSuccess(true);
      load();
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : "Gagal mengunggah bukti pembayaran."
      );
    } finally {
      setIsUploading(false);
    }
  }

  /** Update bukti yang sudah ada (path ada, belum diverifikasi) — endpoint sama */
  async function handleUpdate(file: File) {
    if (!transaction) return;
    setIsUpdating(true);
    try {
      await uploadTransactionProof({ transactionId: transaction.id, file });
      load(); // refresh agar gambar terbaru langsung tampil
    } finally {
      setIsUpdating(false);
    }
    // error dilempar ke TransactionProofCard untuk ditampilkan inline
  }

  async function handleRepeatOrder() {
    if (!transaction) return;
    setIsRepeating(true);
    try {
      await repeatOrder({ transactionId: transaction.id, userId });
      navigate("/transactions");
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsRepeating(false);
    }
  }

  async function handleUpdateStatus() {
    if (!transaction) return;

    setIsUpdatingProgress(true);
    try {
      await updateTransactionProgress({
        trxId: transaction.id,
        userId,
      });
      await load();
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error ? err.message : "Gagal memperbarui status transaksi."
      );
    } finally {
      setIsUpdatingProgress(false);
    }
  }

  const progressSteps = transaction
    ? getTransactionProgressSteps(transaction)
    : [];

  /**
   * Tampilkan form upload pertama kali jika:
   * - transaksi tidak CANCELLED
   * - transaction_proof tidak ada ATAU path-nya null
   */
  const showUpload =
    transaction !== null &&
    transaction.status_trx_code !== "CANCELLED" &&
    (transaction.transaction_proof === null ||
      transaction.transaction_proof.path === null);

  /** Tampilkan info bank jika status PENDING dan ada data bank */
  const showBanks =
    transaction !== null &&
    transaction.status_trx_code === "PENDING" &&
    Array.isArray(transaction.banks) &&
    transaction.banks.length > 0;

  const canUpdateStatus =
    transaction !== null &&
    transaction.progress_type_code?.toUpperCase() === "SENDING";

  /**
   * Pembayaran dianggap VERIFIED jika ada finance_callback_at
   * DAN tidak ada alasan penolakan (finance_callback_reason null/kosong).
   * onUpdate hanya di-pass jika BELUM verified — mencakup status "menunggu" DAN "ditolak".
   */
  function resolveOnUpdate(proof: TransactionProof) {
    const isVerified =
      proof.finance_callback_at !== null &&
      (proof.finance_callback_reason === null ||
        proof.finance_callback_reason.trim() === "");

    return isVerified ? undefined : handleUpdate;
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-luxury pb-12 pt-36 md:pb-16 md:pt-44">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="container relative space-y-4">
          <Link
            to="/transactions"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-75"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pesanan Saya
          </Link>
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Transaction Detail
            </p>
            <h1 className="font-display text-4xl md:text-5xl">
              Detail Pesanan
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          {isLoading && <TransactionDetailSkeleton />}

          {!isLoading && fetchError && (
            <div className="rounded-[2rem] border border-border/60 bg-white p-8 text-center soft-shadow space-y-4">
              <p className="text-muted-foreground">{fetchError}</p>
              <Button onClick={load} variant="outline" className="rounded-full">
                Coba Lagi
              </Button>
            </div>
          )}

          {!isLoading && !fetchError && transaction && (
            <div className="space-y-6">
              <TransactionSummaryCard transaction={transaction} />

              <TransactionProgress steps={progressSteps} />

              <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                {/* Left */}
                <div className="space-y-6">
                  <TransactionProductsList products={transaction.products} />
                  <TransactionShippingCard shipping={transaction.shippings} />
                </div>

                {/* Right */}
                <div className="space-y-6">
                  {canUpdateStatus && (
                    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-4">
                      <h2 className="font-display text-xl">Update Status Pesanan</h2>
                      <p className="text-sm text-muted-foreground">
                        Tandai pesanan ini sudah selesai diterima.
                      </p>
                      <Button
                        type="button"
                        className="w-full rounded-full"
                        disabled={isUpdatingProgress}
                        onClick={handleUpdateStatus}
                      >
                        {isUpdatingProgress ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memperbarui...</>
                        ) : (
                          "Tandai Selesai"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Info bank rekening tujuan — hanya tampil saat PENDING */}
                  {showBanks && (
                    <TransactionBankCard
                      banks={transaction.banks!}
                      ongkir={transaction.shippings.ongkir}
                      subtotal={transaction.final_total - transaction.shippings.ongkir}
                      finalTotal={transaction.final_total}
                    />
                  )}

                  {showUpload ? (
                    /* path === null → belum ada bukti, form upload pertama */
                    <TransactionProofUpload
                      transactionId={transaction.id}
                      isUploading={isUploading}
                      isSuccess={uploadSuccess}
                      error={uploadError}
                      onSubmit={handleUpload}
                    />
                  ) : (
                    /* path sudah ada → tampilkan kartu bukti + opsi ganti jika belum diverifikasi */
                    transaction.transaction_proof && (
                      <TransactionProofCard
                        proof={transaction.transaction_proof}
                        onUpdate={resolveOnUpdate(transaction.transaction_proof)}
                        isUpdating={isUpdating}
                      />
                    )
                  )}

                  {/* Repeat Order */}
                  {transaction.status_trx_code === "DONE" && (
                    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-4">
                      <h2 className="font-display text-xl">Pesan Lagi</h2>
                      <p className="text-sm text-muted-foreground">
                        Suka dengan pesananmu? Pesan lagi dengan satu klik.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full"
                        disabled={isRepeating}
                        onClick={handleRepeatOrder}
                      >
                        {isRepeating ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</>
                        ) : (
                          <><RotateCcw className="mr-2 h-4 w-4" />Repeat Order</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
