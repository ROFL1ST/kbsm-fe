import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Star, Layers, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  fetchProducts,
  fetchCategories,
  mapProductToCard,
  PRODUCT_CACHE_TTL,
} from "@/lib/products";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<number | "">("");

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
    queryKey: ["products", { search: searchQuery, category_id: selectedCategory, status: selectedStatus }],
    queryFn: () => fetchProducts({ search: searchQuery, categoryId: selectedCategory, status: selectedStatus }),
    select: (items) => items.map(mapProductToCard),
    staleTime: PRODUCT_CACHE_TTL,
    gcTime: PRODUCT_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    setSearchParams(next, { replace: true });
  };

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
          {/* Filters Section */}
          <div className="mb-10 space-y-5 animate-fade-in">
            {/* Search result banner */}
            {searchQuery && (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-accent/60 px-5 py-3.5 text-sm backdrop-blur-sm">
                <Search className="h-4 w-4 shrink-0 text-primary" />
                <p className="flex-1 text-foreground">
                  Menampilkan hasil untuk{" "}
                  <span className="font-semibold text-primary">"{searchQuery}"</span>
                </p>
                <button
                  onClick={clearSearch}
                  aria-label="Hapus pencarian"
                  className="flex items-center gap-1.5 rounded-full border border-border/60 bg-white/70 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent active:bg-accent"
                >
                  <X className="h-3 w-3" />
                  Hapus
                </button>
              </div>
            )}

            {/* Status filter (Semua / Best Seller) */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedStatus("")}
                className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shadow-sm ${
                  selectedStatus === ""
                    ? "bg-foreground text-background"
                    : "bg-white border border-border/60 text-foreground hover:bg-accent active:bg-accent"
                }`}
              >
                <Layers className="h-4 w-4" />
                Semua Produk
              </button>
              <button
                onClick={() => setSelectedStatus(1)}
                className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shadow-sm ${
                  selectedStatus === 1
                    ? "bg-foreground text-background"
                    : "bg-white border border-border/60 text-foreground hover:bg-accent active:bg-accent"
                }`}
              >
                <Star className="h-4 w-4" />
                Best Seller
              </button>
            </div>

            {/* Category filter */}
            <ScrollArea className="w-full">
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
          </div>

          {isError ? (
            <div className="glass-card rounded-3xl p-8 text-center text-muted-foreground animate-fade-in">
              Gagal memuat daftar produk. Coba refresh beberapa saat lagi.
            </div>
          ) : !isLoading && products.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center animate-fade-in">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-xl mb-2">Produk Tidak Ditemukan</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ada produk yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain atau hapus filter.`
                  : "Belum ada produk yang tersedia untuk kategori ini."}
              </p>
              {(searchQuery || selectedCategory !== "" || selectedStatus !== "") && (
                <button
                  onClick={() => {
                    clearSearch();
                    setSelectedCategory("");
                    setSelectedStatus("");
                  }}
                  className="mt-6 min-h-[44px] px-6 text-sm font-medium text-primary hover:underline active:underline"
                >
                  Reset Semua Filter
                </button>
              )}
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
