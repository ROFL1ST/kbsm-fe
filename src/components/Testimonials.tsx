import { Star, Quote } from "lucide-react";
import t1 from "@/assets/testimonial-1.jpg";
import t2 from "@/assets/testimonial-2.jpg";
import t3 from "@/assets/testimonial-3.jpg";

const reviews = [
  {
    img: t1,
    name: "Aurellia P.",
    role: "Verified Buyer • Jakarta",
    text:
      "Setelah 4 minggu pakai Radiance Serum, kulit saya jauh lebih cerah dan glowing. Teksturnya ringan, tidak lengket. Brand skincare lokal favorit saya sekarang!",
    rating: 5,
  },
  {
    img: t2,
    name: "Maharani S.",
    role: "Verified Buyer • Bandung",
    text:
      "Velvet Hydra Cream benar-benar mengubah rutinitas malam saya. Bangun pagi kulit terasa kenyal, lembap sepanjang hari. Worth every rupiah.",
    rating: 5,
  },
  {
    img: t3,
    name: "Clarissa W.",
    role: "Verified Buyer • Surabaya",
    text:
      "Packaging mewah, formula premium. Ini setara dengan brand luar yang harganya 3x lipat. Sangat recommended untuk yang butuh skincare berkualitas.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Customer Stories</p>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Real results, <em className="italic gradient-text">real love</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <article
              key={r.name}
              className="bg-card border border-border/50 rounded-3xl p-8 hover-lift soft-shadow relative"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" />

              <div className="flex items-center gap-1 mb-4">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>

              <p className="text-foreground/80 leading-relaxed mb-6 text-[15px]">
                "{r.text}"
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-border/50">
                <img
                  src={r.img}
                  alt={r.name}
                  loading="lazy"
                  width={56}
                  height={56}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-display text-base">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
