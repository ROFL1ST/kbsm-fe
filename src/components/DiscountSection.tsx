import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/products";
import discounts from "@/data/discounts";

const SLIDE_INTERVAL = 4500;
const TRANSITION_MS = 600;

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

/* ── Countdown box ─────────────────────────────────────────── */
const Box = ({ v, l, compact }: { v: number; l: string; compact?: boolean }) => (
  <div className="text-center">
    <div className={`glass-card tabular-nums font-display font-semibold text-foreground ${
      compact
        ? "px-3 py-2 min-w-[48px] text-xl"
        : "px-4 md:px-6 py-3 md:py-4 min-w-[68px] md:min-w-[88px] text-3xl md:text-5xl"
    }`}>
      {String(v).padStart(2, "0")}
    </div>
    <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1.5">{l}</div>
  </div>
);

/* ── Slide content: gambar (crossfade) ────────────────────── */
const SlideImage = ({
  item, isActive, compact,
}: {
  item: (typeof discounts)[number];
  isActive: boolean;
  compact?: boolean;
}) => (
  <div
    className="absolute inset-0"
    style={{
      opacity: isActive ? 1 : 0,
      transform: isActive ? "scale(1)" : "scale(1.04)",
      transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1), transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`,
      pointerEvents: isActive ? "auto" : "none",
    }}
  >
    {item.image ? (
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        width={compact ? 600 : 900}
        height={compact ? 600 : 900}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gradient-luxury flex items-center justify-center">
        <Tag className={compact ? "h-14 w-14 text-primary/20" : "h-20 w-20 text-primary/20"} />
      </div>
    )}
  </div>
);

/* ── Slide content: teks (fade + slide-up) ────────────────── */
const SlideText = ({
  item, isActive, compact, prev, next, total, active, setActive,
}: {
  item: (typeof discounts)[number];
  isActive: boolean;
  compact?: boolean;
  prev: () => void;
  next: () => void;
  total: number;
  active: number;
  setActive: (i: number) => void;
}) => {
  const t = useCountdown(item.valid_until);

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center"
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateY(0)" : "translateY(14px)",
        transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1), transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`,
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      <div className={compact ? "space-y-4" : "space-y-7"}>
        <p className={`uppercase tracking-[0.3em] text-primary ${
          compact ? "text-[10px]" : "text-xs"
        }`}>Penawaran Terbatas</p>

        {compact ? (
          <div>
            <em className="font-display text-2xl md:text-3xl lg:text-2xl xl:text-3xl italic gradient-text leading-tight block">
              Diskon {item.discount_percentage}%
            </em>
            <h3
              className="font-display text-2xl md:text-3xl lg:text-2xl xl:text-3xl leading-tight overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: "calc(1.25 * 2em)",
              }}
            >
              {item.name}
            </h3>
          </div>
        ) : (
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance leading-[1.05]">
            <em className="italic gradient-text">Diskon {item.discount_percentage}%</em>
            <br />{item.name}
          </h2>
        )}

        {!compact && (
          <p className="text-muted-foreground max-w-md">
            Dapatkan{" "}
            <span className="font-semibold text-foreground">{item.category}</span>{" "}
            premium Kasta Beauté dengan harga terbaik. Stok terbatas — jangan sampai kehabisan!
          </p>
        )}

        <div className={`flex items-baseline ${compact ? "gap-2" : "gap-3"}`}>
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

        <div className={`flex ${compact ? "gap-2" : "gap-3 md:gap-4"}`}>
          <Box v={t.d} l="Days" compact={compact} />
          <Box v={t.h} l="Hours" compact={compact} />
          <Box v={t.m} l="Min" compact={compact} />
          <Box v={t.s} l="Sec" compact={compact} />
        </div>

        <div className={`flex items-center ${compact ? "gap-2 pt-1" : "gap-4"}`}>
          <Button
            asChild
            size={compact ? "default" : "lg"}
            className={`rounded-full bg-foreground text-background hover:bg-primary uppercase elegant-shadow group ${
              compact
                ? "h-11 px-5 text-xs tracking-[0.15em]"
                : "h-14 px-8 text-sm tracking-[0.15em]"
            }`}
          >
            <Link to={`/shop/product/${item.product_unit_id}`}>
              Shop Now
              <ArrowRight className={`ml-2 group-hover:translate-x-1 transition-transform ${
                compact ? "h-3.5 w-3.5" : "h-4 w-4"
              }`} />
            </Link>
          </Button>

          {total > 1 && (
            <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2"}`}>
              <button
                onClick={prev}
                aria-label="Previous"
                className={`rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent active:bg-accent transition-colors ${
                  compact ? "h-9 w-9" : "h-11 w-11"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className={`rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent active:bg-accent transition-colors ${
                  compact ? "h-9 w-9" : "h-11 w-11"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Dots hanya di teks area untuk compact */}
        {compact && total > 1 && (
          <div className="flex items-center gap-2 pt-1">
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
    </div>
  );
};

/* ── Shared slider ─────────────────────────────────────────── */
const DiscountSlider = ({ compact }: { compact?: boolean }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = discounts.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setActive(i), []);
  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);

  // Reset timer on manual navigation
  useEffect(() => {
    if (total <= 1 || paused) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, [active, total, paused, next]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {compact ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-center">

          {/* ─ Gambar: stack semua slide, crossfade ─ */}
          <div className="relative overflow-hidden rounded-3xl luxury-shadow aspect-square order-2 lg:order-1">
            {discounts.map((item, i) => (
              <SlideImage key={item.product_unit_id} item={item} isActive={i === active} compact />
            ))}

            {/* Badge diskon overlay — pakai active item */}
            <div
              className="absolute top-4 left-4 bg-foreground text-background rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5"
              style={{ transition: `opacity ${TRANSITION_MS}ms` }}
            >
              <Sparkles className="h-2.5 w-2.5 text-primary" />
              -{discounts[active].discount_percentage}% Off
            </div>

            {/* Dots di gambar (non-compact, tapi compact juga punya di teks) */}
          </div>

          {/* ─ Teks: stack semua slide, fade+slide-up ─ */}
          <div className="relative order-1 lg:order-2" style={{ minHeight: compact ? 360 : 480 }}>
            {discounts.map((item, i) => (
              <SlideText
                key={item.product_unit_id}
                item={item}
                isActive={i === active}
                compact
                prev={prev}
                next={next}
                total={total}
                active={active}
                setActive={goTo}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ── FULL: Home page layout ─────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ─ Gambar ─ */}
          <div className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden luxury-shadow order-2 lg:order-1">
            {discounts.map((item, i) => (
              <SlideImage key={item.product_unit_id} item={item} isActive={i === active} />
            ))}
            <div className="absolute top-6 left-6 bg-foreground text-background px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              -{discounts[active].discount_percentage}% Off
            </div>
            {total > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {discounts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      i === active ? "w-6 h-2 bg-foreground" : "w-2 h-2 bg-foreground/30 hover:bg-foreground/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ─ Teks ─ */}
          <div className="relative order-1 lg:order-2" style={{ minHeight: 480 }}>
            {discounts.map((item, i) => (
              <SlideText
                key={item.product_unit_id}
                item={item}
                isActive={i === active}
                prev={prev}
                next={next}
                total={total}
                active={active}
                setActive={goTo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Export ──────────────────────────────────────────────────── */
const DiscountSection = ({ compact }: { compact?: boolean }) => {
  if (compact) return <DiscountSlider compact />;

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
