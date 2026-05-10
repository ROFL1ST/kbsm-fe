import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Leaf,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Testimonials from "@/components/Testimonials";
import { cn } from "@/lib/utils";
import kastaLogo from "@/assets/kasta.png";
import { useAbout } from "@/hooks/use-about";

/* ---------- Icon map ---------- */
const ICON_MAP: Record<string, LucideIcon> = {
  Leaf,
  ShieldCheck,
  Heart,
};

/* ---------- Stat counter hook ---------- */
function useCountUp(target: number, duration = 1800, start = false, decimals = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const raw = eased * target;
      setCount(decimals > 0 ? parseFloat(raw.toFixed(decimals)) : Math.floor(raw));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration, decimals]);
  return count;
}

const StatCard = ({
  value,
  suffix = "",
  label,
  started,
  displayValue,
}: {
  value: number;
  suffix?: string;
  label: string;
  started: boolean;
  displayValue?: string;
}) => {
  const count = useCountUp(value, 1600, started);

  const display = displayValue ?? count;
  console.log("display", display);
  return (
    <div className="glass-card p-6 md:p-8 text-center space-y-1 animate-fade-up">
      <p className="font-display text-4xl md:text-5xl tabular-nums">
        {display}
        <span className="text-primary">{suffix}</span>
      </p>
      <p className="text-sm text-muted-foreground tracking-wide">{label}</p>
    </div>
  );
};

/* ---------- Skeleton ---------- */
function AboutSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-40 md:pt-48 pb-20 md:pb-28 overflow-hidden bg-gradient-luxury">
        <div className="container relative text-center space-y-6 max-w-3xl mx-auto">
          <div className="skeleton h-7 w-36 rounded-full mx-auto" />
          <div className="skeleton h-16 w-3/4 rounded-xl mx-auto" />
          <div className="skeleton h-6 w-2/3 rounded-lg mx-auto" />
          <div className="flex justify-center gap-3 pt-2">
            <div className="skeleton h-12 w-44 rounded-full" />
            <div className="skeleton h-12 w-44 rounded-full" />
          </div>
        </div>
      </section>
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="skeleton rounded-3xl min-h-[420px]" />
            <div className="space-y-4">
              <div className="skeleton h-7 w-32 rounded-full" />
              <div className="skeleton h-12 w-3/4 rounded-xl" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Error ---------- */
function AboutError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="flex flex-col items-center justify-center py-40 gap-6 text-center px-4">
        <p className="text-muted-foreground text-sm max-w-sm">{message}</p>
        <Button
          onClick={onRetry}
          variant="outline"
          className="rounded-full border-border/60 hover:border-primary hover:text-primary"
        >
          Coba Lagi
        </Button>
      </section>
      <Footer />
    </main>
  );
}

/* ---------- Page ---------- */
export default function AboutPage() {
  const { content, isLoading, error, refetch } = useAbout();
  const statsRef = useRef<HTMLElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setStatsStarted(false);
  }, [content]);

  useEffect(() => {
    document.title = "Tentang Kami \u2014 Kasta Beau\u00e9";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsStarted(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [content]);

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.hash]);

  if (isLoading) return <AboutSkeleton />;
  if (error || !content)
    return (
      <AboutError
        message={error ?? "Konten tidak tersedia."}
        onRetry={refetch}
      />
    );

  const { hero, brand_story, stats, values, cta } = content;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* 1. HERO */}
      <section className="relative pt-40 md:pt-48 pb-20 md:pb-28 overflow-hidden bg-gradient-luxury">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] bg-blush rounded-full blur-3xl" />

        <div className="container relative text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            {hero.badge}
          </div>

          <h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight animate-fade-up"
            dangerouslySetInnerHTML={{ __html: hero.title_html }}
          />

          <div
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-up delay-75 [&>p]:text-muted-foreground [&>p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: hero.subtitle_html }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 animate-fade-up delay-100">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-foreground text-background hover:bg-primary transition-colors px-8 h-12 text-sm tracking-[0.1em] uppercase w-full sm:w-auto"
            >
              <Link to={hero.cta_primary.href}>
                {hero.cta_primary.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-border/60 hover:border-primary hover:text-primary transition-colors px-8 h-12 text-sm tracking-[0.1em] uppercase w-full sm:w-auto"
            >
              <Link to={hero.cta_secondary.href}>
                {hero.cta_secondary.label}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. BRAND STORY */}
      <section id="our-story" className="py-20 md:py-28">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative order-2 md:order-1 animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-luxury p-12 md:p-16 flex flex-col items-center justify-center gap-6 min-h-[420px]">
                <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-blush rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <img
                    src={kastaLogo}
                    alt="Kasta Beau\u00e9"
                    loading="lazy"
                    width={200}
                    height={200}
                    className="w-[160px] md:w-[200px] object-contain drop-shadow-2xl"
                  />
                  <div className="w-16 h-px bg-primary/40" />
                  <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground text-center">
                    Est. {brand_story.established_year} \u00b7{" "}
                    {brand_story.location}
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-5 md:bottom-8 md:-right-8 glass-card px-5 py-4 rounded-2xl space-y-0.5 shadow-lg animate-fade-up">
                <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                  Berdiri sejak
                </p>
                <p className="font-display text-3xl">
                  {brand_story.established_year}
                </p>
              </div>
            </div>

            <div className="order-1 md:order-2 space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {brand_story.badge}
              </div>
              <h2
                className="font-display text-4xl md:text-5xl leading-tight"
                dangerouslySetInnerHTML={{ __html: brand_story.title_html }}
              />
              <div
                className="space-y-4 text-muted-foreground leading-relaxed [&>p]:text-muted-foreground [&>p]:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: brand_story.content_html }}
              />
              <div className="flex flex-wrap gap-2 pt-2">
                {brand_story.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full px-4 py-1.5 text-xs tracking-wide bg-accent/60 hover:bg-accent/80 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS */}
      <section ref={statsRef} className="py-16 md:py-20 bg-gradient-luxury">
        <div className="container">
          <div className="text-center mb-12 space-y-3 animate-fade-up">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {stats.badge}
            </div>
            <h2
              className="font-display text-4xl md:text-5xl"
              dangerouslySetInnerHTML={{ __html: stats.title_html }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.items.map((item) => {
              const isDecimal = item.suffix === "/5";
              const displayValue = isDecimal
                ? (item.value / 10).toFixed(1)
                : undefined;

              return (
                <StatCard
                  key={item.label}
                  value={isDecimal ? item.value / 10 : item.value}
                  suffix={item.suffix}
                  label={item.label}
                  started={statsStarted}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. VALUES */}
      {values.items.length > 0 && (
        <section id="kenapa-memilih-kami" className="py-20 md:py-28">
          <div className="container">
            <div className="text-center mb-14 space-y-3 animate-fade-up">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {values.badge}
              </div>
              <h2
                className="font-display text-4xl md:text-5xl"
                dangerouslySetInnerHTML={{ __html: values.title_html }}
              />
              {values.subtitle_html && (
                <div
                  className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed [&>p]:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: values.subtitle_html }}
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.items.map((item, idx) => {
                const Icon = ICON_MAP[item.icon] ?? Sparkles;
                return (
                  <div
                    key={item.title}
                    className="glass-card p-8 space-y-4 group hover-lift animate-fade-up"
                    style={{ animationDelay: `${idx * 120}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-primary/30 group-hover:bg-primary transition-colors duration-500" />
                      <Icon className="h-5 w-5 text-primary shrink-0" />
                    </div>
                    <h3 className="font-display text-xl">{item.title}</h3>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed [&>p]:text-muted-foreground [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1 [&>ul>li]:text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: item.description_html,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. CUSTOMER STORIES */}
      <div id="customer-stories" className="bg-gradient-luxury">
        <Testimonials />
      </div>

      {/* 6. CTA */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="glass-card p-10 md:p-16 text-center space-y-7 max-w-3xl mx-auto relative overflow-hidden animate-fade-up">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blush rounded-full blur-3xl pointer-events-none" />
            <div className="relative space-y-5">
              <h2
                className="font-display text-4xl md:text-5xl leading-tight text-balance"
                dangerouslySetInnerHTML={{ __html: cta.title_html }}
              />
              <div
                className="text-muted-foreground leading-relaxed max-w-md mx-auto text-sm [&>p]:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: cta.subtitle_html }}
              />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "rounded-full bg-foreground text-background hover:bg-primary transition-colors",
                    "px-10 h-14 text-sm tracking-[0.1em] uppercase w-full sm:w-auto",
                    "shadow-lg hover:shadow-primary/25",
                  )}
                >
                  <Link to={cta.cta_primary.href}>
                    {cta.cta_primary.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-border/60 hover:border-primary hover:text-primary transition-colors px-10 h-14 text-sm tracking-[0.1em] uppercase w-full sm:w-auto"
                >
                  <Link to={cta.cta_secondary.href}>
                    {cta.cta_secondary.label}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
