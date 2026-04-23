const logos = [
  "Vogue", "Harper's Bazaar", "Elle", "Cosmopolitan", "Marie Claire", "Allure", "Glamour", "InStyle"
];

const Marquee = () => (
  <section className="py-10 border-y border-border/50 bg-background overflow-hidden">
    <div className="flex animate-marquee gap-16 whitespace-nowrap">
      {[...logos, ...logos].map((l, i) => (
        <span
          key={i}
          className="font-display text-2xl md:text-3xl italic text-muted-foreground/50 hover:text-primary transition-colors"
        >
          {l}
        </span>
      ))}
    </div>
  </section>
);

export default Marquee;
