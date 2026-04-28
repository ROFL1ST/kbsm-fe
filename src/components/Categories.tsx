import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CATEGORY_CACHE_TTL, fetchCategories } from "@/lib/categories";

const Categories = () => {
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: CATEGORY_CACHE_TTL,
    gcTime: CATEGORY_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <section id="collections" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Shop by Category
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Find your <em className="italic gradient-text">perfect</em> ritual
          </h2>
        </div>

        {isError ? (
          <div className="glass-card rounded-3xl p-8 text-center text-muted-foreground">
            Gagal memuat kategori. Coba refresh beberapa saat lagi.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {isLoading && categories.length === 0
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted animate-pulse"
                  />
                ))
              : categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/shop?category_id=${category.id}`}
                    className="group relative aspect-[4/5] overflow-hidden rounded-3xl soft-shadow hover-lift"
                  >
                    <img
                      src={category.path}
                      alt={category.name}
                      loading="lazy"
                      width={600}
                      height={750}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-background sm:p-6">
                      <div className="flex items-end">
                        <h3 className="inline-flex max-w-full rounded-full border border-white/35 bg-white/15 px-3.5 py-2 font-display text-xl leading-none shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white sm:px-4 sm:py-2.5 sm:text-2xl md:text-3xl">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
