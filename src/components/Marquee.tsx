import { useQuery } from "@tanstack/react-query";
import { CATEGORY_CACHE_TTL, fetchCategories } from "@/lib/categories";

const Marquee = () => {
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: CATEGORY_CACHE_TTL,
    gcTime: CATEGORY_CACHE_TTL * 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoading) return null;
  if (isError) return null;

  return (
    <section className="py-10 border-y border-border/50 bg-background overflow-hidden">
      <div className="flex animate-marquee gap-20 whitespace-nowrap">
        {[...categories, ...categories, ...categories, ...categories].map(
          (category, i) => (
            <span
              key={`${category.name}-${i}`}
              className="font-display text-2xl md:text-3xl italic text-muted-foreground/50 hover:text-primary transition-colors"
            >
              {category.name}
            </span>
          ),
        )}
      </div>
    </section>
  );
};

export default Marquee;
