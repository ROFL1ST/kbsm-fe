import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, ArrowRight } from "lucide-react";
import categoryImg from "@/assets/category-skincare.jpg";

const target = Date.now() + 1000 * 60 * 60 * 38 + 1000 * 60 * 14;

const calc = () => {
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
};

const FlashSale = () => {
  const [t, setT] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);

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

  return (
    <section className="py-20 md:py-28 bg-gradient-nude relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden luxury-shadow order-2 lg:order-1">
          <img
            src={categoryImg}
            alt="Flash sale skincare"
            loading="lazy"
            width={900}
            height={700}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 bg-foreground text-background px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-primary" />
            Flash Sale
          </div>
        </div>

        <div className="order-1 lg:order-2 space-y-7">
          <p className="text-xs tracking-[0.3em] uppercase text-primary">Limited Time Offer</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance leading-[1.05]">
            Up to <em className="italic gradient-text">50% Off</em>
            <br /> Premium Skincare Sets
          </h2>
          <p className="text-muted-foreground max-w-md">
            Koleksi eksklusif dengan harga terbaik. Lengkapi ritual kecantikanmu
            sebelum waktu habis.
          </p>

          <div className="flex gap-3 md:gap-4">
            <Box v={t.d} l="Days" />
            <Box v={t.h} l="Hours" />
            <Box v={t.m} l="Min" />
            <Box v={t.s} l="Sec" />
          </div>

          <Button
            asChild
            size="lg"
            className="rounded-full bg-foreground text-background hover:bg-primary h-14 px-8 text-sm tracking-[0.15em] uppercase elegant-shadow group"
          >
            <Link to="/shop">
              Shop Deals
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
