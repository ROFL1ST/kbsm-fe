import { MapPin, Phone, Truck } from "lucide-react";
import type { TransactionShipping } from "@/types/transaction";

interface Props {
  shipping: TransactionShipping;
}

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function TransactionShippingCard({ shipping }: Props) {
  return (
    <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-8 soft-shadow md:px-8 space-y-4">
      <h2 className="font-display text-2xl">Informasi Pengiriman</h2>

      <div className="space-y-3">
        <div className="flex gap-3">
          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">{shipping.receiver_name}</p>
            <p className="text-sm text-muted-foreground">{shipping.address}</p>
            <p className="text-sm text-muted-foreground">
              {shipping.subdistrict_name}, {shipping.district_name},{" "}
              {shipping.city_name}, {shipping.province_name}{" "}
              {shipping.postal_code}
            </p>
            <p className="mt-0.5 text-xs text-primary">{shipping.label}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm">{shipping.phone_number}</p>
        </div>

        <div className="flex gap-3">
          <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">
              {shipping.delivery} · {shipping.service}
            </p>
            <p className="text-xs text-muted-foreground">
              {shipping.description}
              {shipping.etd && shipping.etd !== "-"
                ? ` · ETD ${shipping.etd}`
                : ""}
            </p>
            {shipping.resi && (
              <p className="mt-0.5 text-xs text-primary">
                No. Resi: {shipping.resi}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Biaya pengiriman</span>
        <span className="font-semibold text-foreground">
          {formatRupiah(shipping.ongkir)}
        </span>
      </div>
    </div>
  );
}
