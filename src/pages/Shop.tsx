import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import {
  fetchProducts,
  mapProductToCard,
  PRODUCT_CACHE_TTL,
} from "@/lib/products";

const Shop = () => {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    select: (items) => items.map(mapProductToCard),
    staleTime: PRODUCT_CACHE_TTL,
    gcTime: PRODUCT_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    document.title = "Shop - Kasta Beaute";
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-luxury pb-16 pt-40 md:pb-20 md:pt-48">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="container relative">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Complete Collection
            </p>
            <h1 className="font-display text-5xl leading-tight text-balance md:text-6xl lg:text-7xl">
              Shop <em className="italic gradient-text">All</em> Products
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Jelajahi seluruh katalog produk Kasta Beaute, termasuk best seller,
              produk diskon, dan koleksi terbaru dari endpoint produk utama.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-white/60 px-4 py-2 backdrop-blur">
                {isLoading ? "Memuat produk..." : `${products.length} produk tersedia`}
              </span>
              <Link
                to="/"
                className="story-link inline-flex items-center gap-2 font-medium uppercase tracking-[0.15em] text-primary"
              >
                Kembali ke Home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container">
          {isError ? (
            <div className="glass-card rounded-3xl p-8 text-center text-muted-foreground">
              Gagal memuat daftar produk. Coba refresh beberapa saat lagi.
            </div>
          ) : !isLoading && products.length === 0 ? (
            <div className="glass-card rounded-3xl p-8 text-center text-muted-foreground">
              Belum ada produk yang tersedia.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4">
              {isLoading && products.length === 0
                ? Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-[3/4] rounded-3xl bg-muted animate-pulse"
                    />
                  ))
                : products.map((product) => (
                    <ProductCard key={product.id} p={product} />
                  ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
};

export default Shop;
