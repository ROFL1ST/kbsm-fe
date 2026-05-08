export type TransactionProgressTypeCode =
  | "FOLLOW_UP"
  | "PROCESS"
  | "SHIPPING"
  | "DONE"
  | string;

export type TransactionStatusCode =
  | "PENDING"
  | "PAID"
  | "PROCESS"
  | "SHIPPING"
  | "DONE"
  | "CANCELLED"
  | string;

export interface TransactionShipping {
  id: number;
  purchase_order_client_id: string;
  delivery: string;
  ongkir: number;
  code: string;
  service: string;
  description: string;
  etd: string;
  user_id: string;
  receiver_name: string;
  phone_number: string;
  address: string;
  label: string;
  province_id?: number;
  city_id?: number;
  district_id?: number;
  subdistrict_id?: number;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  resi: string | null;
}

export interface TransactionProduct {
  purchase_order_client_id: string;
  name: string;
  unit_code: string;
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  quantity: number;
  price: number;
  discount_amount: number;
  final_total: number;
  path: string;
}

export interface TransactionProof {
  id: number;
  purchase_order_client_id: string;
  user_id: string;
  price: number;
  /** null = bukti belum diunggah, string = URL bukti pembayaran */
  path: string | null;
  finance_callback_by: string | null;
  transaction_code: string | null;
  type: number;
  finance_callback_reason: string | null;
  finance_callback_at: string | null;
  payment_type: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by?: string | null;
}

export interface TransactionBank {
  id: number;
  code: string;
  name: string;
  account_number: string;
  account_name: string;
  logo: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionDetailData {
  id: string;
  user_id: string;
  progress_type_code: TransactionProgressTypeCode;
  status_trx_code: TransactionStatusCode;
  progress: string;
  status_trx: string;
  purchase_order_client_code: string;
  final_total: number;
  created_at: string;
  shippings: TransactionShipping;
  products: TransactionProduct[];
  /** Selalu ada di response, tapi path-nya bisa null jika bukti belum diunggah */
  transaction_proof: TransactionProof | null;
  /** Hanya ada ketika status_trx_code === "PENDING", selain itu null */
  banks: TransactionBank[] | null;
}

export interface TransactionDetailResponse {
  status: boolean;
  message: string;
  data: TransactionDetailData;
  error: unknown;
}

export interface TransactionProgressStep {
  key: string;
  label: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isFailed: boolean;
}

/** userId dihapus — endpoint upload-proof tidak memerlukan user_id di body */
export interface UploadTransactionProofPayload {
  transactionId: string;
  file: File;
}

export interface UploadTransactionProofResponse {
  status: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
}

export interface RepeatOrderPayload {
  transactionId: string;
  userId: string;
}

export interface RepeatOrderResponse {
  status: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
}

export interface UpdateTransactionProgressPayload {
  trxId: string;
  userId: string;
}

export interface UpdateTransactionProgressResponse {
  status: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
}
