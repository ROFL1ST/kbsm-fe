import { useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchReviews, type Review } from "@/lib/reviews";
import { Button } from "@/components/ui/button";

const CARDS_PER_VIEW = 3;

/* ── Skeleton ──────────────────────────────────────────── */
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

/* ── Card ──────────────────────────────────────────────── */
const ReviewCard = ({ r }: { r: Review }) => (
  <article className="bg-card border border-border/50 rounded-3xl p-8 hover-lift soft-shadow relative flex flex-col h-full">
    <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" />

    <div className="flex items-center gap-1 mb-4">
      {[...Array(Math.min(r.rating, 5))].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
      ))}
    </div>

    <p className="text-foreground/80 leading-relaxed mb-6 text-[15px] line-clamp-5 flex-1">
      &ldquo;{r.review}&rdquo;
    </p>

    <div className="flex items-center gap-3 pt-5 border-t border-border/50">
      <img
        src={r.image}
        alt={r.name}
        loading="lazy"
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover shrink-0"
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
);

/* ── Main ──────────────────────────────────────────────── */
const Testimonials = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // 0-based page index

  useEffect(() => {
    fetchReviews()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && reviews.length === 0) return null;

  const totalPages = Math.ceil(reviews.length / CARDS_PER_VIEW);
  const currentCards = reviews.slice(
    page * CARDS_PER_VIEW,
    page * CARDS_PER_VIEW + CARDS_PER_VIEW
  );

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Customer Stories</p>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Real results, <em className="italic gradient-text">real love</em>
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6 min-h-[280px]">
          {loading
            ? [...Array(CARDS_PER_VIEW)].map((_, i) => <ReviewSkeleton key={i} />)
            : currentCards.map((r) => <ReviewCard key={r.id} r={r} />)}
        </div>

        {/* Navigation — hanya muncul kalau data > 3 */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              disabled={page === 0}
              aria-label="Previous reviews"
              className="rounded-full h-10 w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dot indicators */}
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  aria-label={`Go to page ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === page
                      ? "w-6 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={next}
              disabled={page === totalPages - 1}
              aria-label="Next reviews"
              className="rounded-full h-10 w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
