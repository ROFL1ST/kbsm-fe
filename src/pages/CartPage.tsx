import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { hasAccessToken } from "@/lib/auth";
import { fetchCart } from "@/lib/cart";
import { formatRupiah, getProductImages } from "@/lib/products";

const CartPage = () => {
  const isLoggedIn = hasAccessToken();

  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: isLoggedIn,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    document.title = "Keranjang Belanja - Kasta Beaute";
  }, []);

  useEffect(() => {
    if (!isError || !error) {
      return;
    }

    const message = error instanceof Error ? error.message : "Gagal memuat keranjang.";
    toast.error(message);
  }, [error, isError]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const items = cart?.items ?? [];
  const summary = cart?.summary;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-luxury pb-14 pt-36 md:pb-16 md:pt-44">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="container relative">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Shopping Cart
            </p>
            <h1 className="font-display text-4xl leading-tight text-balance md:text-5xl lg:text-6xl">
              Review <em className="italic gradient-text">Your Cart</em>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Cek kembali produk pilihanmu sebelum lanjut ke proses checkout.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Lanjut belanja
            </Link>
            <span className="rounded-full border border-border/60 bg-white px-4 py-2 text-sm text-muted-foreground">
              {isLoading ? "Memuat keranjang..." : `${items.length} item di keranjang`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-40 rounded-3xl bg-muted animate-pulse" />
                ))}
              </div>
              <div className="h-96 rounded-3xl bg-muted animate-pulse" />
            </div>
          ) : isError ? (
            <div className="rounded-3xl border border-border/60 bg-white p-8 text-center text-muted-foreground soft-shadow">
              Keranjang gagal dimuat. Coba refresh beberapa saat lagi.
            </div>
          ) : items.length === 0 || !summary ? (
            <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-14 text-center soft-shadow md:px-12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Keranjang kamu masih kosong</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Belum ada produk yang tersimpan di keranjang. Tambahkan produk dari katalog dan kembali
                lagi ke sini untuk melanjutkan checkout.
              </p>
              <Button asChild className="mt-6 h-12 rounded-full px-8">
                <Link to="/shop">Mulai belanja</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <div className="space-y-4">
                {items.map((item) => {
                  const image = getProductImages(item.product)[0] ?? "";
                  const productPrice = item.product.discount_flag
                    ? item.product.final_price
                    : item.product.price;

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-[2rem] border border-border/60 bg-white p-5 soft-shadow md:p-6"
                    >
                      <div className="flex flex-col gap-5 md:flex-row">
                        <Link
                          to={`/shop/product/${item.product_unit_id}`}
                          className="block w-full overflow-hidden rounded-2xl bg-gradient-nude md:w-44"
                        >
                          <img
                            src={image}
                            alt={item.product.product_name}
                            className="aspect-square h-full w-full object-cover"
                            loading="lazy"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[11px] uppercase tracking-[0.24em] text-primary">
                                  {item.product.category_name}
                                </p>
                                <Link to={`/shop/product/${item.product_unit_id}`}>
                                  <h2 className="mt-1 line-clamp-2 text-xl font-semibold leading-tight text-foreground transition-colors hover:text-primary">
                                    {item.product.product_name}
                                  </h2>
                                </Link>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-foreground">
                                  {formatRupiah(item.calculation.final_price)}
                                </p>
                                {item.calculation.discount_amount > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    Hemat {formatRupiah(item.calculation.discount_amount)}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
                                Qty {item.quantity}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border/60 pt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Harga per item</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {formatRupiah(productPrice)}
                                </span>
                                {item.product.discount_flag && item.product.discount_amount > 0 && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatRupiah(item.product.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link
                              to={`/shop/product/${item.product_unit_id}`}
                              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                            >
                              Lihat detail produk
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[2rem] border border-border/60 bg-white p-6 soft-shadow md:p-7 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-primary">Order Summary</p>
                      <h2 className="mt-2 text-2xl font-semibold text-foreground">Ringkasan belanja</h2>
                    </div>
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>

                  <div className="mt-8 space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">
                        {formatRupiah(summary.total_price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-primary">
                        -{formatRupiah(summary.discount_amount)}
                      </span>
                    </div>
                    <div className="border-t border-border/60 pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-base font-semibold text-foreground">Estimated total</span>
                        <span className="text-xl font-semibold text-foreground">
                          {formatRupiah(summary.final_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="mt-8 h-12 w-full rounded-full text-sm uppercase tracking-[0.16em]">
                    <Link to="/pre-checkout">Lanjut ke Checkout</Link>
                  </Button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
};

export default CartPage;
