import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Minus, Plus, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { hasAccessToken } from "@/lib/auth";
import { fetchCart, updateCartItem, type CartItem } from "@/lib/cart";
import { formatRupiah, getProductImages } from "@/lib/products";
import { cn } from "@/lib/utils";

const buildSelectedSummary = (items: CartItem[]) =>
  items.reduce(
    (summary, item) => ({
      total_price: summary.total_price + item.calculation.total_price,
      discount_amount: summary.discount_amount + item.calculation.discount_amount,
      final_price: summary.final_price + item.calculation.final_price,
    }),
    {
      total_price: 0,
      discount_amount: 0,
      final_price: 0,
    }
  );

const CartPage = () => {
  const isLoggedIn = hasAccessToken();
  const queryClient = useQueryClient();
  const [pendingCartItemId, setPendingCartItemId] = useState<number | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const refreshCartQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ["cart"] });
    void queryClient.invalidateQueries({ queryKey: ["navbar-cart"] });
  };

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

  const updateCartMutation = useMutation({
    mutationFn: updateCartItem,
    onMutate: (variables) => {
      setPendingCartItemId(variables.id);
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal memperbarui keranjang.";
      toast.error(message);
    },
    onSettled: () => {
      setPendingCartItemId(null);
      refreshCartQueries();
    },
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
  const selectedItems = items.filter((item) => item.is_selected);
  const selectedSummary = buildSelectedSummary(selectedItems);
  const selectedCount = selectedItems.length;
  const allItemsSelected = items.length > 0 && selectedCount === items.length;
  const isCartUpdating = updateCartMutation.isPending || isBulkUpdating;

  const handleSelectAll = async (checked: boolean) => {
    if (items.length === 0) {
      return;
    }

    setIsBulkUpdating(true);
    try {
      await Promise.all(
        items.map((item) =>
          updateCartItem({
            id: item.id,
            is_selected: checked,
          })
        )
      );
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Gagal memperbarui pilihan produk.";
      toast.error(message);
    } finally {
      setIsBulkUpdating(false);
      refreshCartQueries();
    }
  };

  const handleItemSelection = (item: CartItem, checked: boolean) => {
    updateCartMutation.mutate({
      id: item.id,
      is_selected: checked,
    });
  };

  const handleQuantityChange = (item: CartItem, nextQuantity: number) => {
    if (nextQuantity === item.quantity || nextQuantity <= 0) {
      return;
    }

    updateCartMutation.mutate({
      id: item.id,
      quantity: nextQuantity,
    });
  };

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
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border/60 bg-white px-5 py-4 soft-shadow">
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={allItemsSelected}
                      disabled={isCartUpdating}
                      onCheckedChange={(checked) => handleSelectAll(checked === true)}
                      className="h-5 w-5 rounded-md"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      Pilih semua produk
                    </span>
                  </label>
                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    {selectedCount} dari {items.length} dipilih
                  </span>
                </div>

                {items.map((item) => {
                  const image = getProductImages(item.product)[0] ?? "";
                  const productPrice = item.product.discount_flag
                    ? item.product.final_price
                    : item.product.price;
                  const isItemUpdating =
                    pendingCartItemId === item.id || isBulkUpdating;
                  const maxQuantity = Math.max(
                    item.quantity,
                    item.product.total_quantity || item.quantity
                  );

                  return (
                    <article
                      key={item.id}
                      className={cn(
                        "overflow-hidden rounded-[2rem] border border-border/60 bg-white p-5 soft-shadow transition-opacity md:p-6",
                        !item.is_selected && "opacity-75"
                      )}
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <label className="inline-flex min-h-10 cursor-pointer items-center gap-3 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5">
                          <Checkbox
                            checked={item.is_selected}
                            disabled={isItemUpdating}
                            onCheckedChange={(checked) =>
                              handleItemSelection(item, checked === true)
                            }
                            className="h-5 w-5 rounded-md"
                          />
                          <span className="text-sm font-medium text-foreground">
                            Pilih produk
                          </span>
                        </label>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-medium",
                            item.is_selected
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.is_selected ? "Siap checkout" : "Tidak dipilih"}
                        </span>
                      </div>

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
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                              <div className="sm:text-right">
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
                          </div>

                          <div className="flex flex-col gap-4 border-t border-border/60 pt-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm text-muted-foreground">Harga per item</p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
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
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                              <div className="flex h-10 w-fit items-center overflow-hidden rounded-full border border-border/60 bg-white">
                                <button
                                  type="button"
                                  className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                  disabled={isItemUpdating || item.quantity <= 1}
                                  onClick={() =>
                                    handleQuantityChange(item, item.quantity - 1)
                                  }
                                  aria-label={`Kurangi ${item.product.product_name}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <div className="flex h-full min-w-12 items-center justify-center border-x border-border/60 px-3 text-sm font-semibold">
                                  {item.quantity}
                                </div>
                                <button
                                  type="button"
                                  className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                  disabled={
                                    isItemUpdating || item.quantity >= maxQuantity
                                  }
                                  onClick={() =>
                                    handleQuantityChange(item, item.quantity + 1)
                                  }
                                  aria-label={`Tambah ${item.product.product_name}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
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
                    <div className="rounded-2xl bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                      {selectedCount > 0
                        ? `${selectedCount} produk akan diproses saat checkout.`
                        : "Pilih minimal satu produk untuk lanjut checkout."}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">
                        {formatRupiah(selectedSummary.total_price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-primary">
                        -{formatRupiah(selectedSummary.discount_amount)}
                      </span>
                    </div>
                    <div className="border-t border-border/60 pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-base font-semibold text-foreground">Estimated total</span>
                        <span className="text-xl font-semibold text-foreground">
                          {formatRupiah(selectedSummary.final_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedCount > 0 ? (
                    <Button asChild className="mt-8 h-12 w-full rounded-full text-sm uppercase tracking-[0.16em]">
                      <Link to="/pre-checkout">Lanjut ke Checkout</Link>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled
                      className="mt-8 h-12 w-full rounded-full text-sm uppercase tracking-[0.16em]"
                    >
                      Pilih Produk Dulu
                    </Button>
                  )}
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
