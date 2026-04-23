import { Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Newsletter = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-luxury p-10 md:p-16 lg:p-20 luxury-shadow">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blush rounded-full blur-3xl" />

          <div className="relative max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Join Our Beauty Circle
            </div>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance leading-tight">
              Get Beauty Tips & <em className="italic gradient-text">Exclusive Offers</em>
            </h2>

            <p className="text-muted-foreground max-w-md mx-auto">
              Berlangganan newsletter kami dan dapatkan diskon 15% untuk pembelian pertama,
              tips kecantikan eksklusif, dan akses awal ke koleksi terbaru.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="pl-11 h-14 rounded-full bg-white border-white/80 text-base"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-full bg-foreground text-background hover:bg-primary h-14 px-7 text-sm tracking-[0.15em] uppercase group"
              >
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <p className="text-xs text-muted-foreground">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
