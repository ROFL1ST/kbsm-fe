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
import TransactionDetailSkeleton from "@/components/transaction/TransactionDetailSkeleton";

import {
  fetchTransactionDetail,
  repeatOrder,
  uploadTransactionProof,
} from "@/lib/transaction-detail";
import { getTransactionProgressSteps } from "@/lib/transaction-progress";
import { getAuthUser } from "@/lib/auth";
import type { TransactionDetailData } from "@/types/transaction";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getAuthUser();
  const userId = user?.id ?? "";

  const [transaction, setTransaction] = useState<TransactionDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isRepeating, setIsRepeating] = useState(false);

  useEffect(() => {
    document.title = "Detail Transaksi \u2014 Kasta Beau\u00e9";
  }, []);

  function load() {
    if (!id || !userId) return;
    setIsLoading(true);
    setFetchError(null);

    fetchTransactionDetail({ userId, transactionId: id })
      .then((data) => setTransaction(data))
      .catch((err: unknown) =>
        setFetchError(
          err instanceof Error ? err.message : "Gagal memuat detail transaksi."
        )
      )
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [id, userId]);

  async function handleUpload(file: File) {
    if (!transaction) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      // userId tidak dikirim — endpoint hanya butuh transaction_id + file
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

  const progressSteps = transaction
    ? getTransactionProgressSteps(transaction)
    : [];

  const showUpload =
    transaction !== null &&
    (transaction.status_trx_code === "PENDING" ||
      transaction.transaction_proof === null) &&
    transaction.status_trx_code !== "CANCELLED";

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
              <Button
                onClick={load}
                variant="outline"
                className="rounded-full"
              >
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
                  {showUpload ? (
                    <TransactionProofUpload
                      transactionId={transaction.id}
                      isUploading={isUploading}
                      isSuccess={uploadSuccess}
                      error={uploadError}
                      onSubmit={handleUpload}
                    />
                  ) : (
                    transaction.transaction_proof && (
                      <TransactionProofCard
                        proof={transaction.transaction_proof}
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
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Repeat Order
                          </>
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
