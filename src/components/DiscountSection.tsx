import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/products";
import discounts from "@/data/discounts";

const SLIDE_INTERVAL = 4000;

/* ── Countdown ─────────────────────────────────────────────── */
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

/* ── Countdown boxes ──────────────────────────────────────── */
const Box = ({ v, l, compact }: { v: number; l: string; compact?: boolean }) => (
  <div className="text-center">
    <div className={`glass-card tabular-nums font-display font-semibold text-foreground ${
      compact
        ? "px-3 py-2 min-w-[52px] text-2xl"
        : "px-4 md:px-6 py-3 md:py-4 min-w-[68px] md:min-w-[88px] text-3xl md:text-5xl"
    }`}>
      {String(v).padStart(2, "0")}
    </div>
    <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-2">{l}</div>
  </div>
);

/* ── Shared slider content (used in both modes) ───────────── */
interface SliderContentProps {
  compact?: boolean;
}

const DiscountSlider = ({ compact }: SliderContentProps) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = discounts.length;

  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [total, paused, next]);

  const item = discounts[active];
  const t = useCountdown(item.valid_until);

  const content = (
    <div
      className={`grid gap-8 items-center ${
        compact ? "grid-cols-2" : "grid-cols-1 lg:grid-cols-2 gap-12"
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden rounded-3xl luxury-shadow ${
          compact ? "aspect-square" : "aspect-square lg:aspect-[4/5] order-2 lg:order-1"
        }`}
      >
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
            <Tag className={compact ? "h-12 w-12 text-primary/20" : "h-20 w-20 text-primary/20"} />
          </div>
        )}

        {/* Badge */}
        <div className={`absolute top-4 left-4 bg-foreground text-background rounded-full uppercase flex items-center gap-1.5 tracking-[0.15em] ${
          compact ? "px-3 py-1 text-[10px]" : "px-4 py-2 text-xs"
        }`}>
          <Sparkles className={compact ? "h-3 w-3 text-primary" : "h-3.5 w-3.5 text-primary"} />
          -{item.discount_percentage}% Off
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {discounts.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? "w-6 h-2 bg-foreground" : "w-2 h-2 bg-foreground/30 hover:bg-foreground/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={compact ? "space-y-4" : "order-1 lg:order-2 space-y-7"}>
        <p className={`uppercase text-primary tracking-[0.25em] ${
          compact ? "text-[10px]" : "text-xs"
        }`}>Penawaran Terbatas</p>

        <h2 className={`font-display text-balance leading-[1.05] ${
          compact ? "text-2xl" : "text-4xl md:text-5xl lg:text-6xl"
        }`}>
          <em className="italic gradient-text">Diskon {item.discount_percentage}%</em>
          <br />{item.name}
        </h2>

        {!compact && (
          <p className="text-muted-foreground max-w-md">
            Dapatkan{" "}
            <span className="font-semibold text-foreground">{item.category}</span>{" "}
            premium Kasta Beauté dengan harga terbaik. Stok terbatas — jangan sampai kehabisan!
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className={`font-display font-semibold text-foreground ${
            compact ? "text-xl" : "text-3xl"
          }`}>
            {formatRupiah(item.final_price)}
          </span>
          <span className={`text-muted-foreground line-through ${
            compact ? "text-sm" : "text-lg"
          }`}>
            {formatRupiah(item.original_price)}
          </span>
        </div>

        {/* Countdown */}
        <div className="flex gap-2 md:gap-3">
          <Box v={t.d} l="Days" compact={compact} />
          <Box v={t.h} l="Hours" compact={compact} />
          <Box v={t.m} l="Min" compact={compact} />
          <Box v={t.s} l="Sec" compact={compact} />
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            size={compact ? "default" : "lg"}
            className={`rounded-full bg-foreground text-background hover:bg-primary text-xs tracking-[0.15em] uppercase elegant-shadow group ${
              compact ? "h-11 px-6" : "h-14 px-8 text-sm"
            }`}
          >
            <Link to={`/shop/product/${item.product_unit_id}`}>
              Shop Now
              <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          {total > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous"
                className="h-9 w-9 rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="h-9 w-9 rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return content;
};

/* ── Full-width section (Home page) ───────────────────────── */
const DiscountSection = ({ compact }: { compact?: boolean }) => {
  if (compact) {
    return <DiscountSlider compact />;
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-nude relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="container relative">
        <DiscountSlider />
      </div>
    </section>
  );
};

export default DiscountSection;
