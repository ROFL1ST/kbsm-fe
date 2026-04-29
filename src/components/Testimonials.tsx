import { useEffect, useRef, useState, useCallback } from "react";
import { Star, Quote } from "lucide-react";
import { fetchReviews, type Review } from "@/lib/reviews";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const PER_PAGE = 10;

/* ── Skeleton card ───────────────────────────────────────── */
const ReviewSkeleton = () => (
  <div className="flex-shrink-0 w-[320px] md:w-[380px] bg-card border border-border/50 rounded-3xl p-8 soft-shadow space-y-4 animate-pulse">
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

/* ── Single review card ──────────────────────────────────── */
const ReviewCard = ({ r, observeRef }: { r: Review; observeRef?: (el: HTMLElement | null) => void }) => (
  <article
    ref={observeRef}
    className="flex-shrink-0 w-[320px] md:w-[380px] bg-card border border-border/50 rounded-3xl p-8 hover-lift soft-shadow relative"
  >
    <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" />

    <div className="flex items-center gap-1 mb-4">
      {[...Array(Math.min(r.rating, 5))].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
      ))}
    </div>

    <p className="text-foreground/80 leading-relaxed mb-6 text-[15px] line-clamp-5">
      &ldquo;{r.review}&rdquo;
    </p>

    <div className="flex items-center gap-3 pt-5 border-t border-border/50">
      <img
        src={r.image}
        alt={r.name}
        loading="lazy"
        width={56}
        height={56}
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

/* ── Main component ──────────────────────────────────────── */
const Testimonials = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextPage, setNextPage] = useState(2); // page 1 dimuat di initial load
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initial load — page 1
  useEffect(() => {
    fetchReviews({ page: 1, perPage: PER_PAGE })
      .then(({ reviews, hasMore, nextPage }) => {
        setReviews(reviews);
        setHasMore(hasMore);
        setNextPage(nextPage);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  // Load next page
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchReviews({ page: nextPage, perPage: PER_PAGE })
      .then(({ reviews: newReviews, hasMore: more, nextPage: np }) => {
        setReviews((prev) => {
          // deduplicate by id
          const ids = new Set(prev.map((r) => r.id));
          return [...prev, ...newReviews.filter((r) => !ids.has(r.id))];
        });
        setHasMore(more);
        setNextPage(np);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, nextPage]);

  // IntersectionObserver: observe sentinel (invisible div after last-3 card)
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadMore, reviews.length]);

  if (!loading && reviews.length === 0) return null;

  // Sentinel diletakkan sebelum 3 card terakhir:
  // index di mana sentinel disisipkan = max(0, reviews.length - 3)
  const sentinelIndex = Math.max(0, reviews.length - 3);

  return (
    <section className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Customer Stories</p>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Real results, <em className="italic gradient-text">real love</em>
          </h2>
        </div>
      </div>

      {/* Horizontal scroll — full-width, padding inset dari container */}
      <div className="relative">
        <ScrollArea className="w-full">
          <div className="flex gap-5 px-4 md:px-8 lg:px-[max(2rem,calc((100vw-1280px)/2+2rem))] pb-4">

            {/* Skeleton saat initial load */}
            {loading && [...Array(3)].map((_, i) => <ReviewSkeleton key={i} />)}

            {/* Cards + sentinel */}
            {reviews.map((r, idx) => (
              <>
                {/* Sentinel: invisible div tepat sebelum 3 card terakhir */}
                {idx === sentinelIndex && hasMore && (
                  <div
                    key="sentinel"
                    ref={sentinelRef}
                    aria-hidden="true"
                    className="w-0 h-0 flex-shrink-0"
                  />
                )}
                <ReviewCard key={r.id} r={r} />
              </>
            ))}

            {/* Skeleton inline saat load more */}
            {loadingMore && [...Array(2)].map((_, i) => <ReviewSkeleton key={`more-${i}`} />)}

            {/* End spacer */}
            <div className="flex-shrink-0 w-4" aria-hidden="true" />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default Testimonials;
