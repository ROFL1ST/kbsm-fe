import type { TransactionProduct } from "@/types/transaction";

interface Props {
  products: TransactionProduct[];
}

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function TransactionProductsList({ products }: Props) {
  const subtotal = products.reduce((sum, p) => sum + p.final_total, 0);

  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-4 py-6 soft-shadow sm:px-6 sm:py-8 md:px-8">
      <h2 className="font-display text-xl sm:text-2xl mb-5">Item Pesanan</h2>

      <div className="space-y-3">
        {products.map((product, i) => (
          <div
            key={`${product.product_detail_id}-${i}`}
            className="rounded-2xl border border-border/60 bg-background/80 p-3 sm:p-4"
          >
            {/* Row atas: gambar + info + harga */}
            <div className="flex gap-3">
              {/* Gambar */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-20 sm:rounded-2xl">
                <img
                  src={product.path}
                  alt={product.name}
                  width={80}
                  height={80}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info + harga */}
              <div className="flex flex-1 flex-col justify-between min-w-0">
                {/* Nama + unit */}
                <div className="min-w-0">
                  <p className="font-medium text-sm leading-snug break-words">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.unit_code}
                  </p>
                </div>

                {/* Qty × harga — baris sendiri di xs agar tidak overflow */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <p className="text-xs text-muted-foreground">
                    {product.quantity} × {formatRupiah(product.price)}
                  </p>
                  <p className="text-sm font-semibold shrink-0">
                    {formatRupiah(product.final_total)}
                  </p>
                </div>

                {/* Badge diskon — baris terpisah kalau ada */}
                {product.discount_amount > 0 && (
                  <p className="mt-1 text-xs text-primary">
                    diskon {formatRupiah(product.discount_amount)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Subtotal:{" "}
          <span className="font-semibold text-foreground">
            {formatRupiah(subtotal)}
          </span>
        </p>
      </div>
    </div>
  );
}
