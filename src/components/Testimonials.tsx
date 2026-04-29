import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { fetchReviews, type Review } from "@/lib/reviews";

// Skeleton for a single review card
const ReviewSkeleton = () => (
  <div className="bg-card border border-border/50 rounded-3xl p-8 soft-shadow space-y-4 animate-pulse">
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-4 w-4 rounded-sm bg-muted" />
      ))}
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-5/6" />
      <div className="h-3 bg-muted rounded w-4/6" />
    </div>
    <div className="flex items-center gap-3 pt-5 border-t border-border/50">
      <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 bg-muted rounded w-2/5" />
        <div className="h-3 bg-muted rounded w-3/5" />
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  // Silent fail — if no data and not loading, hide the section
  if (!loading && reviews.length === 0) return null;

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
          {loading
            ? [...Array(3)].map((_, i) => <ReviewSkeleton key={i} />)
            : reviews.map((r) => (
                <article
                  key={r.id}
                  className="bg-card border border-border/50 rounded-3xl p-8 hover-lift soft-shadow relative"
                >
                  <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" />

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>

                  <p className="text-foreground/80 leading-relaxed mb-6 text-[15px]">
                    &ldquo;{r.review}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-5 border-t border-border/50">
                    <img
                      src={r.image}
                      alt={r.name}
                      loading="lazy"
                      width={56}
                      height={56}
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) => {
                        const initials = r.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const fallback = document.createElement("div");
                        fallback.className =
                          "h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0";
                        fallback.innerHTML = `<span class="text-xs font-semibold text-primary">${initials}</span>`;
                        target.parentNode?.insertBefore(fallback, target);
                      }}
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
