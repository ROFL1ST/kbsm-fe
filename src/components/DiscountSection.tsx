import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/products";
import discounts, { type DiscountItem } from "@/data/discounts";

/* ── Countdown hook ─────────────────────────────────────── */
function useCountdown(validUntil: string) {
  const calc = () => {
    const diff = Math.max(0, new Date(validUntil).getTime() - Date.now());
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / (1000 * 60)) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validUntil]);
  return t;
}

/* ── Per-card countdown display ──────────────────────────── */
const CardTimer = ({ validUntil }: { validUntil: string }) => {
  const t = useCountdown(validUntil);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <Clock className="h-3 w-3 shrink-0 text-primary" />
      <span className="tabular-nums font-medium">
        {t.d > 0 && `${t.d}d `}{pad(t.h)}:{pad(t.m)}:{pad(t.s)}
      </span>
    </div>
  );
};

/* ── Discount Card ───────────────────────────────────────── */
const DiscountCard = ({ item, index }: { item: DiscountItem; index: number }) => (
  <article
    className="group relative overflow-hidden rounded-3xl bg-card soft-shadow hover-lift animate-fade-up"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    {/* Image area */}
    <div className="relative aspect-square overflow-hidden bg-gradient-nude">
      {/* Discount badge */}
      <span className="absolute left-3 top-3 z-10 rounded-full bg-foreground px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-background">
        -{item.discount_percentage}%
      </span>

      <Link to={`/shop/product/${item.product_unit_id}`} aria-label={`Lihat detail ${item.name}`}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={800}
            height={800}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-luxury">
            <Tag className="h-12 w-12 text-primary/30" />
          </div>
        )}
      </Link>
    </div>

    {/* Info */}
    <div className="p-4 sm:p-5 space-y-2.5">
      <Badge
        variant="secondary"
        className="rounded-full px-3 py-1 text-[10px] uppercase tracking-wide bg-accent/60"
      >
        {item.category}
      </Badge>

      <Link to={`/shop/product/${item.product_unit_id}`}>
        <h3 className="line-clamp-2 font-display text-base leading-tight transition-colors hover:text-primary sm:text-lg">
          {item.name}
        </h3>
      </Link>

      {/* Price row */}
      <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
        <span className="font-display text-base font-semibold text-foreground sm:text-lg">
          {formatRupiah(item.final_price)}
        </span>
        <span className="text-xs text-muted-foreground line-through">
          {formatRupiah(item.original_price)}
        </span>
      </div>

      {/* Countdown */}
      <CardTimer validUntil={item.valid_until} />

      {/* CTA */}
      <Button
        asChild
        size="sm"
        className="w-full rounded-full bg-foreground text-background hover:bg-primary text-xs uppercase tracking-[0.15em] h-10 group/btn"
      >
        <Link to={`/shop/product/${item.product_unit_id}`}>
          Shop Now
          <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </div>
  </article>
);

/* ── Section ─────────────────────────────────────────────── */
const DiscountSection = () => (
  <section className="py-20 md:py-28 bg-gradient-luxury">
    <div className="container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 animate-fade-up">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Penawaran Terbatas
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance leading-[1.05]">
            Diskon <em className="italic gradient-text">Spesial</em> Hari Ini
          </h2>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Dapatkan produk premium Kasta Beaut&#233; dengan harga terbaik. Stok terbatas — jangan sampai kehabisan!
          </p>
        </div>
        <Link
          to="/shop"
          className="story-link text-sm font-medium tracking-[0.15em] uppercase text-primary inline-flex items-center gap-2 shrink-0"
        >
          Lihat Semua <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {discounts.map((item, i) => (
          <DiscountCard key={item.product_unit_id} item={item} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default DiscountSection;
