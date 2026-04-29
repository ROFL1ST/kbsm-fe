import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/products";
import discounts from "@/data/discounts";

const SLIDE_INTERVAL = 4500;
const FADE_MS = 350;

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
    <div
      className={`glass-card tabular-nums font-display font-semibold text-foreground ${
        compact
          ? "px-3 py-2 min-w-[48px] text-xl"
          : "px-3 py-2 min-w-[52px] text-2xl sm:px-4 sm:py-3 sm:min-w-[68px] sm:text-3xl md:px-6 md:py-4 md:min-w-[88px] md:text-5xl"
      }`}
    >
      {String(v).padStart(2, "0")}
    </div>
    <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1.5">{l}</div>
  </div>
);

/* ── Compact slide info (Shop page) ───────────────────────── */
const CompactSlideInfo = ({
  item, visible,
  prev, next, total, active, goTo,
}: {
  item: (typeof discounts)[number];
  visible: boolean;
  prev: () => void;
  next: () => void;
  total: number;
  active: number;
  goTo: (i: number) => void;
}) => {
  const t = useCountdown(item.valid_until);
  return (
    <div
      className="absolute inset-0 flex flex-col justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="space-y-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Penawaran Terbatas</p>
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
        {/* Gambar di antara nama dan harga */}
        <div className="relative overflow-hidden rounded-2xl luxury-shadow aspect-[16/9]">
          {item.image ? (
            <img src={item.image} alt={item.name} loading="lazy" width={600} height={338} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-luxury flex items-center justify-center">
              <Tag className="h-10 w-10 text-primary/20" />
            </div>
          )}
          <div className="absolute top-3 left-3 bg-foreground text-background rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
            -{item.discount_percentage}% Off
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display font-semibold text-foreground text-xl">{formatRupiah(item.final_price)}</span>
          <span className="text-muted-foreground line-through text-sm">{formatRupiah(item.original_price)}</span>
        </div>
        <div className="flex gap-2">
          <Box v={t.d} l="Days" compact />
          <Box v={t.h} l="Hours" compact />
          <Box v={t.m} l="Min" compact />
          <Box v={t.s} l="Sec" compact />
        </div>
        {total > 1 && (
          <div className="flex items-center gap-3">
            <Button asChild size="default" className="rounded-full bg-foreground text-background hover:bg-primary uppercase elegant-shadow group h-11 px-5 text-xs tracking-[0.15em]">
              <Link to={`/shop/product/${item.product_unit_id}`}>
                Shop Now
                <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <button onClick={prev} aria-label="Previous" className="h-9 w-9 rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent active:bg-accent transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next} aria-label="Next" className="h-9 w-9 rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent active:bg-accent transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        {total > 1 && (
          <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
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

/* ── Full slide info (Index page, desktop only — kanan kolom) ─ */
const FullSlideInfo = ({
  item, visible,
  prev, next, total, active, goTo,
}: {
  item: (typeof discounts)[number];
  visible: boolean;
  prev: () => void;
  next: () => void;
  total: number;
  active: number;
  goTo: (i: number) => void;
}) => {
  const t = useCountdown(item.valid_until);
  return (
    <div
      className="absolute inset-0 flex flex-col justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="space-y-7">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Penawaran Terbatas</p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance leading-[1.05]">
          <em className="italic gradient-text">Diskon {item.discount_percentage}%</em>
          <br />{item.name}
        </h2>
        <p className="text-muted-foreground max-w-md">
          Dapatkan <span className="font-semibold text-foreground">{item.category}</span> premium Kasta Beauté dengan harga terbaik. Stok terbatas — jangan sampai kehabisan!
        </p>
        <div className="flex items-baseline gap-3">
          <span className="font-display font-semibold text-foreground text-3xl">{formatRupiah(item.final_price)}</span>
          <span className="text-muted-foreground line-through text-lg">{formatRupiah(item.original_price)}</span>
        </div>
        <div className="flex gap-3 md:gap-4">
          <Box v={t.d} l="Days" />
          <Box v={t.h} l="Hours" />
          <Box v={t.m} l="Min" />
          <Box v={t.s} l="Sec" />
        </div>
        {total > 1 && (
          <div className="flex items-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-foreground text-background hover:bg-primary uppercase elegant-shadow group h-14 px-8 text-sm tracking-[0.15em]">
              <Link to={`/shop/product/${item.product_unit_id}`}>
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <button onClick={prev} aria-label="Previous" className="h-11 w-11 rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent active:bg-accent transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next} aria-label="Next" className="h-11 w-11 rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent active:bg-accent transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        {total > 1 && (
          <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
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

/* ── Compact slider (Shop page) ────────────────────────────── */
const CompactDiscountSlider = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = discounts.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goTo = useCallback((i: number) => setActive(i), []);
  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);
  useEffect(() => {
    if (total <= 1 || paused) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, [active, total, paused, next]);
  return (
    <div className="relative" style={{ minHeight: 520 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {discounts.map((item, i) => (
        <CompactSlideInfo key={item.product_unit_id} item={item} visible={i === active}
          prev={prev} next={next} total={total} active={active} goTo={goTo} />
      ))}
    </div>
  );
};

/* ── Full slider (Index page) ──────────────────────────────── */
const FullDiscountSlider = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = discounts.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goTo = useCallback((i: number) => setActive(i), []);
  const next = useCallback(() => setActive((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActive((p) => (p - 1 + total) % total), [total]);
  useEffect(() => {
    if (total <= 1 || paused) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(next, SLIDE_INTERVAL);
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, [active, total, paused, next]);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-6 xl:gap-12 items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/*
        MOBILE (< lg): urutan DOM = label/diskon → gambar → info lainnya
        Ini dicapai dengan satu kolom penuh:
        - Blok "label + judul diskon" di atas (order-1)
        - Gambar di tengah (order-2)
        - Sisa info (harga, countdown, CTA) di bawah (order-3)
        DESKTOP (≥ lg): 2 kolom — gambar kiri, info kanan (layout asli)
      */}

      {/* ─ Label + judul: tampil di mobile di atas gambar, di desktop hidden (sudah ada di FullSlideInfo) ─ */}
      <div className="lg:hidden order-1 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Penawaran Terbatas</p>
        <div className="relative" style={{ minHeight: 80 }}>
          {discounts.map((item, i) => (
            <div
              key={item.product_unit_id}
              className="absolute inset-0"
              style={{
                opacity: i === active ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
                pointerEvents: i === active ? "auto" : "none",
              }}
            >
              <h2 className="font-display text-3xl sm:text-4xl leading-[1.05]">
                <em className="italic gradient-text">Diskon {item.discount_percentage}%</em>
                <br />{item.name}
              </h2>
            </div>
          ))}
        </div>
      </div>

      {/* ─ Gambar: order-2 di mobile, order-1 di desktop ─ */}
      <div className={`relative overflow-hidden rounded-3xl luxury-shadow order-2 lg:order-1 aspect-square lg:aspect-[4/5]`}>
        <div
          className="flex h-full"
          style={{
            width: `${total * 100}%`,
            transform: `translateX(-${(active * 100) / total}%)`,
            transition: "transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {discounts.map((item) => (
            <div key={item.product_unit_id} className="relative h-full flex-shrink-0" style={{ width: `${100 / total}%` }}>
              {item.image ? (
                <img src={item.image} alt={item.name} loading="lazy" width={900} height={900} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-luxury flex items-center justify-center">
                  <Tag className="h-20 w-20 text-primary/20" />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Badge diskon */}
        <div className="absolute top-4 left-4 bg-foreground text-background rounded-full px-4 py-2 text-xs tracking-[0.2em] uppercase flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          -{discounts[active].discount_percentage}% Off
        </div>
      </div>

      {/* ─ Info kolom kanan (desktop) / bawah gambar (mobile) ─ */}
      <div className="relative order-3 lg:order-2" style={{ minHeight: 500 }}>
        {discounts.map((item, i) => (
          <FullSlideInfo
            key={item.product_unit_id}
            item={item}
            visible={i === active}
            prev={prev}
            next={next}
            total={total}
            active={active}
            goTo={goTo}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Export ─────────────────────────────────────────────────── */
const DiscountSection = ({ compact }: { compact?: boolean }) => {
  if (compact) return <CompactDiscountSlider />;

  return (
    <section className="py-20 md:py-28 bg-gradient-nude relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="container relative">
        <FullDiscountSlider />
      </div>
    </section>
  );
};

export default DiscountSection;
