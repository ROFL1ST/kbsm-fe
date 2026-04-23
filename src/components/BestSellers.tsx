import { Star, Heart, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import serum from "@/assets/product-serum.jpg";
import cream from "@/assets/product-cream.jpg";
import cleanser from "@/assets/product-cleanser.jpg";
import sunscreen from "@/assets/product-sunscreen.jpg";
import mask from "@/assets/product-mask.jpg";
import eye from "@/assets/product-eye.jpg";

export const products = [
  { id: 1, name: "Radiance Glow Serum", category: "Serum", price: 489000, oldPrice: 689000, rating: 4.9, reviews: 1240, image: serum, badge: "Best Seller" },
  { id: 2, name: "Velvet Hydra Cream", category: "Moisturizer", price: 359000, oldPrice: 459000, rating: 4.8, reviews: 892, image: cream, badge: "-25%" },
  { id: 3, name: "Pure Silk Cleanser", category: "Cleanser", price: 249000, rating: 4.9, reviews: 2103, image: cleanser, badge: "New" },
  { id: 4, name: "Daily Shield SPF 50", category: "Sunscreen", price: 289000, oldPrice: 349000, rating: 4.7, reviews: 1567, image: sunscreen, badge: "-20%" },
  { id: 5, name: "Rose Petal Sheet Mask", category: "Mask", price: 89000, rating: 4.8, reviews: 745, image: mask, badge: "Limited" },
  { id: 6, name: "Lumière Eye Renewal", category: "Eye Care", price: 549000, oldPrice: 699000, rating: 4.9, reviews: 432, image: eye, badge: "Premium" },
];

export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const ProductCard = ({ p }: { p: typeof products[number] }) => (
  <article className="group relative bg-card rounded-3xl overflow-hidden soft-shadow hover-lift">
    <div className="relative aspect-square overflow-hidden bg-gradient-nude">
      {p.badge && (
        <span className="absolute top-4 left-4 z-10 bg-foreground text-background text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full">
          {p.badge}
        </span>
      )}
      <button className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Wishlist">
        <Heart className="h-4 w-4" />
      </button>

      <img
        src={p.image}
        alt={p.name}
        loading="lazy"
        width={800}
        height={800}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Hover overlay */}
      <div className="absolute inset-x-4 bottom-4 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
        <Button className="flex-1 rounded-full bg-foreground hover:bg-primary text-background h-11 text-xs tracking-[0.15em] uppercase">
          <ShoppingBag className="h-4 w-4 mr-2" /> Add
        </Button>
        <Button size="icon" variant="outline" className="rounded-full h-11 w-11 bg-white/90 backdrop-blur border-white">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div className="p-5">
      <p className="text-[11px] tracking-[0.2em] uppercase text-primary mb-1.5">{p.category}</p>
      <h3 className="font-display text-lg leading-tight mb-2 line-clamp-1">{p.name}</h3>
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-3 w-3 ${i < Math.round(p.rating) ? "fill-gold text-gold" : "text-muted"}`} />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({p.reviews})</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-lg font-semibold text-foreground">{formatRupiah(p.price)}</span>
        {p.oldPrice && (
          <span className="text-xs text-muted-foreground line-through">{formatRupiah(p.oldPrice)}</span>
        )}
      </div>
    </div>
  </article>
);

const BestSellers = () => {
  return (
    <section id="bestseller" className="py-20 md:py-28 bg-gradient-luxury">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">
              Loved By Thousands
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance max-w-2xl">
              Best <em className="italic gradient-text">Selling</em> Essentials
            </h2>
          </div>
          <a href="#shop" className="story-link text-sm font-medium tracking-[0.15em] uppercase text-primary">
            View All Products →
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
