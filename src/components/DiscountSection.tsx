import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/products";
import discounts from "@/data/discounts";

const SLIDE_INTERVAL = 4500;
const FADE_MS = 350;

type Discount = (typeof discounts)[number];

/* ── Countdown hook ───────────────────────────────────────── */
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

/* ── Countdown box ───────────────────────────────────────── */
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

/* ── Shared: image strip ─────────────────────────────────────── */
const ImageStrip = ({ active, total }: { active: number; total: number }) => (
  <div className="relative overflow-hidden rounded-3xl luxury-shadow aspect-square">
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
    <div className="absolute top-4 left-4 bg-foreground text-background rounded-full px-4 py-2 text-xs tracking-[0.2em] uppercase flex items-center gap-1.5">
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      -{discounts[active].discount_percentage}% Off
    </div>
  </div>
);

/* ── Shared: nav controls + dots ──────────────────────────────── */
const Controls = ({
  item, active, total, compact, prev, next, goTo,
}: {
  item: Discount; active: number; total: number; compact?: boolean;
  prev: () => void; next: () => void; goTo: (i: number) => void;
}) => (
  <>
    {total > 1 && (
      <div className="flex items-center gap-3">
        <Button
          asChild
          size={compact ? "default" : "lg"}
          className={`rounded-full bg-foreground text-background hover:bg-primary uppercase elegant-shadow group ${
            compact ? "h-11 px-5 text-xs tracking-[0.15em]" : "h-14 px-8 text-sm tracking-[0.15em]"
          }`}
        >
          <Link to={`/shop/product/${item.product_unit_id}`}>
            Shop Now
            <ArrowRight className={`ml-2 group-hover:translate-x-1 transition-transform ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
          </Link>
        </Button>
        <button onClick={prev} aria-label="Previous" className={`rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent active:bg-accent transition-colors ${compact ? "h-9 w-9" : "h-11 w-11"}`}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={next} aria-label="Next" className={`rounded-full border border-border/60 bg-white/70 backdrop-blur flex items-center justify-center hover:bg-accent active:bg-accent transition-colors ${compact ? "h-9 w-9" : "h-11 w-11"}`}>
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
  </>
);

/* ── MOBILE layout: flex-col, urutan dijamin ──────────────────────── */
const MobileSlider = () => {
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

  const item = discounts[active];
  const t = useCountdown(item.valid_until);

  return (
    <div
      className="flex flex-col gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 1. Label + judul */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Penawaran Terbatas</p>
        <h2 className="font-display text-4xl leading-[1.05]">
          <em className="italic gradient-text">Diskon {item.discount_percentage}%</em>
          <br />{item.name}
        </h2>
      </div>

      {/* 2. Gambar */}
      <ImageStrip active={active} total={total} />

      {/* 3. Kategori + harga + countdown + CTA */}
      <div className="space-y-5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">{item.category}</p>
        <div className="flex items-baseline gap-3">
          <span className="font-display font-semibold text-foreground text-3xl">{formatRupiah(item.final_price)}</span>
          <span className="text-muted-foreground line-through text-lg">{formatRupiah(item.original_price)}</span>
        </div>
        <div className="flex gap-3">
          <Box v={t.d} l="Days" />
          <Box v={t.h} l="Hours" />
          <Box v={t.m} l="Min" />
          <Box v={t.s} l="Sec" />
        </div>
        <Controls item={item} active={active} total={total} prev={prev} next={next} goTo={goTo} />
      </div>
    </div>
  );
};

/* ── DESKTOP layout: grid 2-col, identik dengan sebelumnya ───────────── */
const DesktopSlider = () => {
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
      className="grid grid-cols-2 gap-6 xl:gap-12 items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Kiri: gambar */}
      <ImageStrip active={active} total={total} />

      {/* Kanan: info — fade per slide */}
      <div className="relative" style={{ minHeight: 500 }}>
        {discounts.map((item, i) => {
          const t = useCountdown(item.valid_until);
          return (
            <div
              key={item.product_unit_id}
              className="absolute inset-0 flex flex-col justify-center"
              style={{
                opacity: i === active ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
                pointerEvents: i === active ? "auto" : "none",
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
                <Controls item={item} active={active} total={total} prev={prev} next={next} goTo={goTo} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Compact slider (Shop page) ──────────────────────────────── */
const CompactSlider = () => {
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

  const item = discounts[active];
  const t = useCountdown(item.valid_until);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <ImageStrip active={active} total={total} />
      <div className="space-y-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Penawaran Terbatas</p>
        <div>
          <em className="font-display text-2xl italic gradient-text leading-tight block">Diskon {item.discount_percentage}%</em>
          <h3 className="font-display text-2xl leading-tight">{item.name}</h3>
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
        <Controls item={item} active={active} total={total} compact prev={prev} next={next} goTo={goTo} />
      </div>
    </div>
  );
};

/* ── Export ────────────────────────────────────────────────── */
const DiscountSection = ({ compact }: { compact?: boolean }) => {
  if (compact) return <CompactSlider />;

  return (
    <section className="py-20 md:py-28 bg-gradient-nude relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="container relative">
        {/* Mobile: flex-col layout */}
        <div className="block lg:hidden">
          <MobileSlider />
        </div>
        {/* Desktop: 2-col grid layout */}
        <div className="hidden lg:block">
          <DesktopSlider />
        </div>
      </div>
    </section>
  );
};

export default DiscountSection;
