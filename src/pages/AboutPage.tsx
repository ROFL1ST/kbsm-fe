import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Leaf,
  ArrowRight,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { cn } from "@/lib/utils";

/* --- Stat counter hook --- */
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* --- Stat card --- */
const StatCard = ({
  value,
  suffix = "",
  label,
  started,
}: {
  value: number;
  suffix?: string;
  label: string;
  started: boolean;
}) => {
  const count = useCountUp(value, 1600, started);
  return (
    <div className="glass-card p-6 md:p-8 text-center space-y-1 animate-fade-up">
      <p className="font-display text-4xl md:text-5xl tabular-nums">
        {count}
        <span className="text-primary">{suffix}</span>
      </p>
      <p className="text-sm text-muted-foreground tracking-wide">{label}</p>
    </div>
  );
};

/* --- Testimonial data --- */
const TESTIMONIALS = [
  {
    id: 1,
    name: "Sari Dewi",
    location: "Jakarta",
    rating: 5,
    text: "Produk Kasta Beauté benar-benar mengubah rutinitas skincare saya. Kulit terasa lebih lembut dan cerah hanya dalam 2 minggu!",
    avatar: "SD",
  },
  {
    id: 2,
    name: "Andini Putri",
    location: "Bandung",
    rating: 5,
    text: "Saya sudah coba banyak brand lokal, tapi Kasta Beauté tetap jadi favorit. Formulanya ringan, nggak bikin jerawat, dan wanginya enak banget.",
    avatar: "AP",
  },
  {
    id: 3,
    name: "Maya Setiawan",
    location: "Surabaya",
    rating: 5,
    text: "Pengiriman cepat, packaging premium, dan yang paling penting produknya memang terbukti hasilnya. Sudah langganan 1 tahun lebih!",
    avatar: "MS",
  },
];

/* --- Value pillars --- */
const VALUES = [
  {
    icon: Leaf,
    title: "Bahan Alami Pilihan",
    description:
      "Setiap produk diformulasikan dari bahan-bahan alami terpilih yang aman untuk semua jenis kulit, tanpa bahan berbahaya.",
  },
  {
    icon: ShieldCheck,
    title: "Tersertifikasi & Teruji",
    description:
      "Seluruh rangkaian produk telah melalui uji dermatologi ketat dan mendapatkan sertifikasi BPOM untuk keamanan terjamin.",
  },
  {
    icon: Heart,
    title: "Dibuat dengan Cinta",
    description:
      "Setiap detail produk dirancang dengan penuh perhatian dari formula hingga kemasan karena kamu layak mendapatkan yang terbaik.",
  },
];

/* --- AboutPage --- */
export default function AboutPage() {
  const statsRef = useRef<HTMLElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    document.title = "Tentang Kami Kasta Beauté";
    window.scrollTo({ top: 0, behavior: "smooth" });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsStarted(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ══════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative pt-40 md:pt-48 pb-20 md:pb-28 overflow-hidden bg-gradient-luxury">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] bg-blush rounded-full blur-3xl" />

        <div className="container relative text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            Tentang Kami
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight animate-fade-up">
            Kecantikan yang{" "}
            <em className="italic font-medium gradient-text">Nyata</em>,<br />
            untuk Kamu
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-up delay-75">
            Kasta Beauté hadir untuk merayakan kecantikan autentik setiap perempuan
            Indonesia dengan produk perawatan kulit yang jujur, aman, dan efektif.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 animate-fade-up delay-100">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-foreground text-background hover:bg-primary transition-colors px-8 h-12 text-sm tracking-[0.1em] uppercase w-full sm:w-auto"
            >
              <Link to="/shop">
                Belanja Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-border/60 hover:border-primary hover:text-primary transition-colors px-8 h-12 text-sm tracking-[0.1em] uppercase w-full sm:w-auto"
            >
              <Link to="/blog">Baca Blog Kami</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          2. BRAND STORY
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Visual */}
            <div className="relative order-2 md:order-1 animate-fade-in">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-nude">
                <img
                  src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80"
                  alt="Kasta Beauté products flat lay"
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 md:bottom-8 md:-right-8 glass-card px-5 py-4 rounded-2xl space-y-0.5 shadow-lg animate-fade-up">
                <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Berdiri sejak</p>
                <p className="font-display text-3xl">2020</p>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 md:order-2 space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Cerita Kami
              </div>

              <h2 className="font-display text-4xl md:text-5xl leading-tight">
                Lahir dari{" "}
                <em className="italic gradient-text">Kebutuhan Nyata</em>
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Kasta Beauté lahir dari satu keyakinan sederhana: setiap perempuan
                  berhak mendapatkan produk perawatan kulit yang berkualitas tanpa harus
                  menguras kantong.
                </p>
                <p>
                  Berawal dari dapur kecil di Bandung pada 2020, kami meracik
                  formula pertama kami dengan bahan-bahan alami lokal terbaik
                  memastikan setiap tetes produk aman, efektif, dan teruji secara
                  dermatologi.
                </p>
                <p>
                  Kini ribuan perempuan Indonesia telah mempercayakan rutinitas
                  kecantikan mereka kepada Kasta Beauté, dan kami terus berinovasi
                  untuk menghadirkan yang terbaik bagi kulit tropis Indonesia.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {["BPOM Certified", "Cruelty Free", "Vegan Friendly", "Made in Indonesia"].map((tag) => (
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

      {/* ══════════════════════════════════════════════════
          3. STATS
      ══════════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-16 md:py-20 bg-gradient-luxury">
        <div className="container">
          <div className="text-center mb-12 space-y-3 animate-fade-up">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Dalam Angka
            </div>
            <h2 className="font-display text-4xl md:text-5xl">
              Dipercaya Ribuan{" "}
              <em className="italic gradient-text">Pelanggan</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={5000} suffix="+" label="Pelanggan Puas" started={statsStarted} />
            <StatCard value={50}   suffix="+" label="Produk Tersedia" started={statsStarted} />
            <StatCard value={49}   suffix="/5" label="Rating Rata-rata" started={statsStarted} />
            <StatCard value={100}  suffix="%" label="Bahan Aman BPOM" started={statsStarted} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4. VALUES
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14 space-y-3 animate-fade-up">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Nilai Kami
            </div>
            <h2 className="font-display text-4xl md:text-5xl">
              Mengapa Memilih{" "}
              <em className="italic gradient-text">Kasta Beauté</em>?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
              Setiap produk yang kami hadirkan mencerminkan komitmen kami terhadap
              kualitas, keamanan, dan kecantikan yang berkelanjutan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, description }, idx) => (
              <div
                key={title}
                className="glass-card p-8 space-y-4 group hover-lift animate-fade-up"
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-primary/30 group-hover:bg-primary transition-colors duration-500" />
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                </div>
                <h3 className="font-display text-xl">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          5. TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-gradient-luxury">
        <div className="container">
          <div className="text-center mb-14 space-y-3 animate-fade-up">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Kata Mereka
            </div>
            <h2 className="font-display text-4xl md:text-5xl">
              Yang Pelanggan Kami{" "}
              <em className="italic gradient-text">Rasakan</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={t.id}
                className="glass-card p-7 space-y-5 flex flex-col animate-fade-up"
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <div className="relative flex-1">
                  <Quote className="h-6 w-6 text-primary/20 absolute -top-1 -left-1" />
                  <p className="text-sm text-muted-foreground leading-relaxed pl-5">{t.text}</p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          6. CTA BANNER
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="glass-card p-10 md:p-16 text-center space-y-7 max-w-3xl mx-auto relative overflow-hidden animate-fade-up">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blush rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-7">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Mulai Sekarang
              </div>

              <h2 className="font-display text-4xl md:text-5xl leading-tight text-balance">
                Siap Merasakan{" "}
                <em className="italic gradient-text">Perbedaannya</em>?
              </h2>

              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto text-sm">
                Temukan produk perawatan kulit yang tepat untuk kamu.
                Ribuan perempuan Indonesia sudah merasakannya sekarang giliran kamu.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "rounded-full bg-foreground text-background hover:bg-primary transition-colors",
                    "px-10 h-14 text-sm tracking-[0.1em] uppercase w-full sm:w-auto",
                    "shadow-lg hover:shadow-primary/25"
                  )}
                >
                  <Link to="/shop">
                    Belanja Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-border/60 hover:border-primary hover:text-primary transition-colors px-10 h-14 text-sm tracking-[0.1em] uppercase w-full sm:w-auto"
                >
                  <Link to="/blog">Baca Tips Kecantikan</Link>
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
