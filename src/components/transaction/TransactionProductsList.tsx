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
    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8">
      <h2 className="font-display text-2xl mb-6">Item Pesanan</h2>

      <div className="space-y-4">
        {products.map((product, i) => (
          <div
            key={`${product.product_detail_id}-${i}`}
            className="flex gap-4 rounded-2xl border border-border/60 bg-background/80 p-4"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
              <img
                src={product.path}
                alt={product.name}
                width={80}
                height={80}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {product.unit_code}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.quantity} × {formatRupiah(product.price)}
                {product.discount_amount > 0 && (
                  <span className="ml-2 text-xs text-primary">
                    (diskon {formatRupiah(product.discount_amount)})
                  </span>
                )}
              </p>
            </div>

            <div className="text-sm font-semibold self-center whitespace-nowrap">
              {formatRupiah(product.final_total)}
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
