import { Link } from "react-router-dom";
import { Star, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah, type ProductCardData } from "@/lib/products";

const ProductCard = ({ p }: { p: ProductCardData }) => (
  <article className="group relative overflow-hidden rounded-3xl bg-card soft-shadow hover-lift">
    <div className="relative aspect-square overflow-hidden bg-gradient-nude">
      {p.badge && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-foreground px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-background">
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

      <div className="absolute inset-x-4 bottom-4 flex translate-y-4 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <Button className="h-11 flex-1 rounded-full bg-foreground text-xs uppercase tracking-[0.15em] text-background hover:bg-primary">
          <ShoppingBag className="mr-2 h-4 w-4" /> Add
        </Button>
        <Button
          asChild
          size="icon"
          variant="outline"
          className="h-11 w-11 rounded-full border-white bg-white/90 backdrop-blur"
        >
          <Link to={`/shop/product/${p.id}`} aria-label={`Detail ${p.name}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>

    <div className="p-5">
      <p className="mb-1.5 text-[11px] uppercase tracking-[0.2em] text-primary">
        {p.category}
      </p>
      <Link to={`/shop/product/${p.id}`}>
        <h3 className="mb-2 line-clamp-1 font-display text-lg leading-tight transition-colors hover:text-primary">
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
      <div className="flex items-baseline gap-2">
        <span className="font-display text-lg font-semibold text-foreground">
          {formatRupiah(p.price)}
        </span>
        {p.oldPrice && (
          <span className="text-xs text-muted-foreground line-through">
            {formatRupiah(p.oldPrice)}
          </span>
        )}
      </div>
    </div>
  </article>
);

export default ProductCard;
