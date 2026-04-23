import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  Heart,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";
import aboutImg from "@/assets/category-skincare.jpg"; // Ganti dengan gambar yang sesuai

const About = () => {
  return (
    <section
      id="about"
      className="relative py-24 md:py-32 overflow-hidden bg-gradient-luxury"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blush rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container relative grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left image side */}
        <div className="relative order-2 lg:order-1 animate-scale-in">
          <div className="absolute inset-0 bg-gradient-rose opacity-20 blur-3xl rounded-full" />
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden luxury-shadow">
            <img
              src={aboutImg}
              alt="Our premium skincare philosophy"
              width={1024}
              height={1280}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Experience badge */}
          <div className="absolute -bottom-6 -right-6 md:-right-10 glass-card p-5 rounded-2xl animate-float">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-rose flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground tracking-wide">
                  Years of Excellence
                </div>
                <div className="font-display text-3xl font-bold text-primary">
                  5+ Years
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="space-y-8 order-1 lg:order-2 animate-fade-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
            <Heart className="h-3.5 w-3.5" />
            Our Story
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
            Beauty That
            <br />
            Comes From{" "}
            <em className="italic font-medium gradient-text">Nature</em>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Kami percaya bahwa kecantikan sejati lahir dari harmoni antara sains
            dan alam. Setiap produk kami diformulasikan dengan bahan-bahan
            terpilih yang aman, efektif, dan ramah lingkungan.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  Formula Teruji Klinis
                </h4>
                <p className="text-sm text-muted-foreground">
                  Setiap produk melalui uji dermatologi dan aman untuk semua
                  jenis kulit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Leaf className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  100% Natural Ingredients
                </h4>
                <p className="text-sm text-muted-foreground">
                  Bahan aktif dari alam tanpa paraben, SLS, dan pewarna buatan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  Ethical & Sustainable
                </h4>
                <p className="text-sm text-muted-foreground">
                  Kemasan ramah lingkungan dan tidak menguji pada hewan.
                </p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-foreground/20 hover:bg-foreground hover:text-background h-14 px-8 text-sm tracking-[0.15em] uppercase bg-transparent group"
          >
            Discover Our Journey
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 pt-6 border-t border-foreground/10">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-primary">
                  50K+
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-primary">
                  100+
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Premium Products</p>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-primary">
                  4.9
                </span>
                <span className="text-sm">/5</span>
              </div>
              <p className="text-xs text-muted-foreground">Customer Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
