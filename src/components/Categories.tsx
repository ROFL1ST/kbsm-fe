import { ArrowUpRight } from "lucide-react";
import serum from "@/assets/product-serum.jpg";
import cream from "@/assets/product-cream.jpg";
import cleanser from "@/assets/product-cleanser.jpg";
import sunscreen from "@/assets/product-sunscreen.jpg";
import mask from "@/assets/product-mask.jpg";
import eye from "@/assets/product-eye.jpg";

const cats = [
  { name: "Serum", image: serum, count: 24 },
  { name: "Cleanser", image: cleanser, count: 18 },
  { name: "Moisturizer", image: cream, count: 21 },
  { name: "Sunscreen", image: sunscreen, count: 12 },
  { name: "Acne Treatment", image: mask, count: 16 },
  { name: "Brightening", image: eye, count: 19 },
];

const Categories = () => {
  return (
    <section id="collections" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Shop by Category</p>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Find your <em className="italic gradient-text">perfect</em> ritual
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {cats.map((c, i) => (
            <a
              key={c.name}
              href="#shop"
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden soft-shadow hover-lift"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={600}
                height={750}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end text-background">
                <p className="text-[10px] tracking-[0.3em] uppercase opacity-80 mb-1">{c.count} Products</p>
                <div className="flex items-end justify-between gap-2">
                  <h3 className="font-display text-2xl md:text-3xl">{c.name}</h3>
                  <div className="h-10 w-10 rounded-full glass flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
