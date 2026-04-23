import { ShieldCheck, Leaf, Award, Heart } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Dermatologically Tested",
    desc: "Diuji oleh dermatolog terkemuka untuk keamanan maksimal di semua jenis kulit.",
  },
  {
    icon: Leaf,
    title: "Natural Ingredients",
    desc: "Diformulasikan dengan bahan alami pilihan dan ekstrak botani premium.",
  },
  {
    icon: Award,
    title: "BPOM Certified",
    desc: "Bersertifikat resmi BPOM dan halal, aman digunakan setiap hari.",
  },
  {
    icon: Heart,
    title: "Cruelty-Free Formula",
    desc: "Tanpa uji coba pada hewan. Berkomitmen pada kecantikan etis dan berkelanjutan.",
  },
];

const Benefits = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Why Choose BelleAura
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Crafted with <em className="italic gradient-text">care</em>,
            backed by science
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className="group bg-card border border-border/50 rounded-3xl p-8 text-center hover-lift soft-shadow"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-16 w-16 mx-auto mb-5 rounded-2xl bg-gradient-luxury flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <b.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
