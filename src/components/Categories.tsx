import { ArrowUpRight } from "lucide-react";
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
                    className="group relative aspect-[4/5] rounded-3xl overflow-hidden soft-shadow hover-lift"
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

                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-background">
                      <p className="text-[10px] tracking-[0.3em] uppercase opacity-80 mb-1">
                        Shop Collection
                      </p>
                      <div className="flex items-end justify-between gap-2">
                        <h3 className="font-display text-2xl md:text-3xl">
                          {category.name}
                        </h3>
                        <div className="h-10 w-10 rounded-full glass flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-45">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
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
