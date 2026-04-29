import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Star, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah, type ProductCardData } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { hasAccessToken } from "@/lib/auth";
import { toast } from "@/components/ui/sonner";
import LoginRequiredDialog from "@/components/LoginRequiredDialog";

const ProductCard = ({ p }: { p: ProductCardData }) => {
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!hasAccessToken()) {
        throw new Error("Kamu harus login dulu sebelum menambahkan produk ke keranjang.");
      }

      await addToCart({
        product_unit_id: p.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      toast.success(`${p.name} ditambahkan ke keranjang.`);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Gagal menambahkan produk ke keranjang.";

      toast.error(message);
      if (message.includes("login")) {
        setLoginPromptOpen(true);
      }
    },
  });

  const handleAddToCart = () => {
    if (!hasAccessToken()) {
      setLoginPromptOpen(true);
      return;
    }

    addToCartMutation.mutate();
  };

  return (
    <>
      <article className="group relative overflow-hidden rounded-3xl bg-card soft-shadow hover-lift">
        <div className="relative aspect-square overflow-hidden bg-gradient-nude">
          {p.badge && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-foreground px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-background sm:left-4 sm:top-4 sm:tracking-[0.2em]">
              {p.badge}
            </span>
          )}

          <Link to={`/shop/product/${p.id}`} aria-label={`Lihat detail ${p.name}`}>
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              width={800}
              height={800}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>

          <div className="absolute inset-x-3 bottom-3 flex translate-y-4 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-4 sm:bottom-4">
            <Button
              className="h-11 flex-1 rounded-full bg-foreground text-xs uppercase tracking-[0.15em] text-background hover:bg-primary"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {addToCartMutation.isPending ? "Adding..." : "Add"}
            </Button>
            <Button
              asChild
              size="icon"
              variant="outline"
              className="hidden h-11 w-11 rounded-full border-white bg-white/90 backdrop-blur sm:inline-flex"
            >
              <Link to={`/shop/product/${p.id}`} aria-label={`Detail ${p.name}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-primary sm:text-[11px] sm:tracking-[0.2em]">
            {p.category}
          </p>
          <Link to={`/shop/product/${p.id}`}>
            <h3 className="mb-2 line-clamp-2 font-display text-base leading-tight transition-colors hover:text-primary sm:text-lg">
              {p.name}
            </h3>
          </Link>
          <div className="mb-3 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(p.rating) ? "fill-gold text-gold" : "text-muted"}`}
              />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">({p.reviews})</span>
          </div>
          <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
            <span className="font-display text-base font-semibold leading-tight text-foreground sm:text-lg">
              {formatRupiah(p.price)}
            </span>
            {p.oldPrice && (
              <span className="max-w-full truncate text-xs text-muted-foreground line-through">
                {formatRupiah(p.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </article>
      <LoginRequiredDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
        productName={p.name}
      />
    </>
  );
};

export default ProductCard;
