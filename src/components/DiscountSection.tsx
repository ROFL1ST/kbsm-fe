import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/products";
import discounts from "@/data/discounts";

const SLIDE_INTERVAL = 4000; // ms

/* ── Countdown per slide ─────────────────────────────────── */
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

/* ── Countdown boxes (same style as FlashSale) ───────────── */
const Box = ({ v, l }: { v: number; l: string }) => (
  <div className="text-center">
    <div className="glass-card px-4 md:px-6 py-3 md:py-4 min-w-[68px] md:min-w-[88px]">
      <div className="font-display text-3xl md:text-5xl font-semibold text-foreground tabular-nums">
        {String(v).padStart(2, "0")}
      </div>
    </div>
    <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-2">{l}</div>
  </div>
);

/* ── Main section ────────────────────────────────────────── */
const DiscountSection = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = discounts.length;

  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  // Auto-slide only when more than 1 item
  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [total, paused, next]);

  const item = discounts[active];
  const t = useCountdown(item.valid_until);

  return (
    <section
      className="py-20 md:py-28 bg-gradient-nude relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Decorative blob */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative grid lg:grid-cols-2 gap-12 items-center">

        {/* Left — image */}
        <div className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden luxury-shadow order-2 lg:order-1">
          {item.image ? (
            <img
              key={item.product_unit_id}
              src={item.image}
              alt={item.name}
              loading="lazy"
              width={900}
              height={900}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-luxury flex items-center justify-center">
              <Tag className="h-20 w-20 text-primary/20" />
            </div>
          )}

          {/* Discount badge */}
          <div className="absolute top-6 left-6 bg-foreground text-background px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            -{item.discount_percentage}% Off
          </div>

          {/* Slider dots — only if > 1 */}
          {total > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {discounts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-6 h-2 bg-foreground"
                      : "w-2 h-2 bg-foreground/30 hover:bg-foreground/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right — content */}
        <div className="order-1 lg:order-2 space-y-7">
          <p className="text-xs tracking-[0.3em] uppercase text-primary">Penawaran Terbatas</p>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance leading-[1.05]">
            <em className="italic gradient-text">Diskon {item.discount_percentage}%</em>
            <br />{item.name}
          </h2>

          <p className="text-muted-foreground max-w-md">
            Dapatkan{" "}
            <span className="font-semibold text-foreground">{item.category}</span>{" "}
            premium Kasta Beauté dengan harga terbaik. Stok terbatas — jangan sampai kehabisan!
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-foreground">
              {formatRupiah(item.final_price)}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              {formatRupiah(item.original_price)}
            </span>
          </div>

          {/* Countdown */}
          <div className="flex gap-3 md:gap-4">
            <Box v={t.d} l="Days" />
            <Box v={t.h} l="Hours" />
            <Box v={t.m} l="Min" />
            <Box v={t.s} l="Sec" />
          </div>

          {/* CTA row */}
          <div className="flex items-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-foreground text-background hover:bg-primary h-14 px-8 text-sm tracking-[0.15em] uppercase elegant-shadow group"
            >
              <Link to={`/shop/product/${item.product_unit_id}`}>
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            {/* Prev / Next arrows — only if > 1 */}
            {total > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  aria-label="Previous"
                  className="h-11 w-11 rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next"
                  className="h-11 w-11 rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscountSection;
