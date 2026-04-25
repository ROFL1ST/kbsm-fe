import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  fetchProducts,
  PRODUCT_CACHE_TTL,
  mapProductToCard,
} from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const BestSellers = () => {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", "best-seller"],
    queryFn: () => fetchProducts({ status: 1 }),
    select: (items) =>
      items
        .slice(0, 4)
        .map(mapProductToCard),
    staleTime: PRODUCT_CACHE_TTL,
    gcTime: PRODUCT_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <section id="bestseller" className="py-20 md:py-28 bg-gradient-luxury">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">
              Loved By Thousands
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance max-w-2xl">
              Best <em className="italic gradient-text">Selling</em> Essentials
            </h2>
          </div>
          <Link to="/shop" className="story-link text-sm font-medium tracking-[0.15em] uppercase text-primary">
            View All Products {">"}
          </Link>
        </div>

        {isError ? (
          <div className="glass-card rounded-3xl p-8 text-center text-muted-foreground">
            Gagal memuat best seller. Coba refresh beberapa saat lagi.
          </div>
        ) : !isLoading && products.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center text-muted-foreground">
            Belum ada produk best seller yang tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {isLoading && products.length === 0
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] rounded-3xl bg-muted animate-pulse"
                  />
                ))
              : products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;
