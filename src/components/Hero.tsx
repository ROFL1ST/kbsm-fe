import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Leaf, ShieldCheck, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.png";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative pt-40 md:pt-48 pb-20 md:pb-32 overflow-hidden bg-gradient-luxury"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-blush rounded-full blur-3xl" />

      <div className="container relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left content */}
        <div className="space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            New Collection 2026
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-tight text-balance">
            Glow <em className="italic font-medium gradient-text">Naturally</em>
            <br />
            With Premium
            <br />
            Skincare
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
            Produk kecantikan berkualitas tinggi dengan formula modern untuk
            kulit sehat, glowing, dan terawat setiap hari.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-foreground text-background hover:bg-primary group h-14 px-8 text-sm tracking-[0.15em] uppercase elegant-shadow"
            >
              <Link to="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 pt-4">
            {[
              { icon: ShieldCheck, label: "BPOM Certified" },
              { icon: Leaf, label: "Cruelty Free" },
              { icon: Sparkles, label: "Natural Ingredients" },
            ].map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white px-3 py-1.5 rounded-full text-xs font-medium text-foreground/80"
              >
                <b.icon className="h-3.5 w-3.5 text-primary" />
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right image */}
        <div className="relative animate-scale-in">
          <div className="absolute inset-0 bg-gradient-rose opacity-20 blur-3xl rounded-full" />
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden luxury-shadow">
            <img
              src={heroImg}
              alt="Premium luxury skincare collection"
              width={1024}
              height={1024}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating cards */}
          <div className="absolute -left-4 md:-left-8 top-1/4 glass-card p-4 rounded-2xl animate-float">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-rose flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Glow Score</div>
                <div className="font-display text-lg font-semibold">+98%</div>
              </div>
            </div>
          </div>

          <div
            className="absolute -right-4 md:-right-8 bottom-1/4 glass-card p-4 rounded-2xl animate-float"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="text-xs text-muted-foreground mb-1">Loved by</div>
            <div className="font-display text-lg font-semibold">50K+ Women</div>
            <div className="flex -space-x-2 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary-glow border-2 border-white"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
