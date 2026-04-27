import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  fetchProducts,
  fetchCategories,
  PRODUCT_CACHE_TTL,
  mapProductToCard,
} from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const BestSellers = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: PRODUCT_CACHE_TTL,
  });

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", "best-seller", { category_id: selectedCategory }],
    queryFn: () =>
      fetchProducts({ status: 1, categoryId: selectedCategory }),
    select: (items) => items.slice(0, 4).map(mapProductToCard),
    staleTime: PRODUCT_CACHE_TTL,
    gcTime: PRODUCT_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <section id="bestseller" className="py-20 md:py-28 bg-gradient-luxury">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3">
              Loved By Thousands
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance max-w-2xl">
              Best <em className="italic gradient-text">Selling</em> Essentials
            </h2>
          </div>
          <Link
            to="/shop"
            className="story-link text-sm font-medium tracking-[0.15em] uppercase text-primary"
          >
            View All Products {">"}
          </Link>
        </div>

        {/* Category Filter */}
        <ScrollArea className="w-full mb-10">
          <div className="flex w-max space-x-2 pb-3">
            <button
              onClick={() => setSelectedCategory("")}
              className={`min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap ${
                selectedCategory === ""
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-border/60 text-foreground hover:bg-accent active:bg-accent"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border border-border/60 text-foreground hover:bg-accent active:bg-accent"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Product Grid */}
        {isError ? (
          <div className="glass-card rounded-3xl p-8 text-center text-muted-foreground">
            Gagal memuat best seller. Coba refresh beberapa saat lagi.
          </div>
        ) : !isLoading && products.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center text-muted-foreground">
            {selectedCategory !== ""
              ? "Belum ada produk best seller untuk kategori ini."
              : "Belum ada produk best seller yang tersedia."}
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
