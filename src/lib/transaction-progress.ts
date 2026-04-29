import type {
  TransactionDetailData,
  TransactionProgressStep,
} from "@/types/transaction";

const BASE_STEPS = [
  {
    key: "pending",
    label: "Menunggu Pembayaran",
    description: "Pesanan dibuat dan menunggu konfirmasi pembayaran",
  },
  {
    key: "follow_up",
    label: "Verifikasi Pembayaran",
    description: "Tim kami sedang memverifikasi pembayaran kamu",
  },
  {
    key: "processed",
    label: "Diproses",
    description: "Pesanan sedang disiapkan oleh tim kami",
  },
  {
    key: "shipping",
    label: "Dikirim",
    description: "Pesanan sedang dalam perjalanan",
  },
  {
    key: "done",
    label: "Selesai",
    description: "Pesanan telah diterima",
  },
] as const;

export function getTransactionProgressSteps(
  transaction: TransactionDetailData
): TransactionProgressStep[] {
  const statusCode = transaction.status_trx_code?.toUpperCase();
  const progressCode = transaction.progress_type_code?.toUpperCase();

  let currentIndex = 0;
  let isFailed = false;

  if (statusCode === "CANCELLED") {
    currentIndex = 0;
    isFailed = true;
  } else if (statusCode === "DONE") {
    currentIndex = 4;
  } else if (statusCode === "SHIPPING" || progressCode === "SENDING") {
    currentIndex = 3;
  } else if (statusCode === "PROCESS" || progressCode === "PACKING") {
    currentIndex = 2;
  } else if (progressCode === "FOLLOW_UP" || statusCode === "PAID") {
    currentIndex = 1;
  } else {
    currentIndex = 0;
  }

  return BASE_STEPS.map((step, index) => ({
    ...step,
    isCompleted: !isFailed && index < currentIndex,
    isCurrent: index === currentIndex,
    isFailed: isFailed && index === currentIndex,
  }));
}
