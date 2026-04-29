import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { getAuthUser, hasAccessToken } from "@/lib/auth";
import {
  calculateCartItemSummary,
  calculateCartSummary,
  fetchCart,
  removeCartItem,
  type CartItem,
  type CartResponseData,
  updateCartItem,
} from "@/lib/cart";
import { formatRupiah, getProductImages } from "@/lib/products";

const CartPage = () => {
  const isLoggedIn = hasAccessToken();
  const authUser = getAuthUser();
  const queryClient = useQueryClient();

  const [localCart, setLocalCart] = useState<CartResponseData | null>(null);
  const [pendingItemIds, setPendingItemIds] = useState<number[]>([]);

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
    if (cart) {
      setLocalCart({
        ...cart,
        summary: calculateCartSummary(cart.items),
      });
    }
  }, [cart]);

  useEffect(() => {
    if (!isError || !error) {
      return;
    }

    const message =
      error instanceof Error ? error.message : "Gagal memuat keranjang.";
    toast.error(message);
  }, [error, isError]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const syncCartCaches = (nextCart: CartResponseData | null) => {
    setLocalCart(nextCart);
    queryClient.setQueryData(["cart"], nextCart ?? undefined);
    queryClient.setQueryData(["navbar-cart"], nextCart ?? undefined);
    queryClient.setQueryData(["pre-checkout-cart"], nextCart ?? undefined);
  };

  const withPendingItem = async (
    itemId: number,
    action: () => Promise<void>
  ) => {
    setPendingItemIds((current) => [...current, itemId]);

    try {
      await action();
    } finally {
      setPendingItemIds((current) =>
        current.filter((currentId) => currentId !== itemId)
      );
    }
  };

  const handleCartUpdate = async (
    item: CartItem,
    changes: Pick<CartItem, "quantity" | "is_selected">
  ) => {
    if (!authUser?.id) {
      toast.error("Sesi login tidak ditemukan. Silakan login kembali.");
      return;
    }

    if (!localCart) {
      return;
    }

    const previousCart = localCart;

    const nextItems = previousCart.items.map((currentItem) => {
      if (currentItem.id !== item.id) {
        return currentItem;
      }

      const nextQuantity = changes.quantity;

      return {
        ...currentItem,
        quantity: nextQuantity,
        is_selected: changes.is_selected,
        calculation: calculateCartItemSummary(currentItem, nextQuantity),
      };
    });

    const nextCart = {
      items: nextItems,
      summary: calculateCartSummary(nextItems),
    };

    syncCartCaches(nextCart);

    await withPendingItem(item.id, async () => {
      try {
        await updateCartItem({
          user_id: authUser.id,
          cart_id: item.id,
          quantity: changes.quantity,
          is_selected: changes.is_selected,
        });
      } catch (updateError) {
        syncCartCaches(previousCart);

        const message =
          updateError instanceof Error
            ? updateError.message
            : "Gagal memperbarui item keranjang.";
        toast.error(message);
      }
    });
  };

  const handleRemoveCartItem = async (cartItemId: number) => {
    if (!localCart) {
      return;
    }

    const previousCart = localCart;

    const nextItems = previousCart.items.filter(
      (item) => item.id !== cartItemId
    );

    const nextCart = {
      items: nextItems,
      summary: calculateCartSummary(nextItems),
    };

    syncCartCaches(nextCart);

    await withPendingItem(cartItemId, async () => {
      try {
        await removeCartItem(cartItemId);
        toast.success("Item berhasil dihapus dari keranjang.");
      } catch (removeError) {
        syncCartCaches(previousCart);

        const message =
          removeError instanceof Error
            ? removeError.message
            : "Gagal menghapus item dari keranjang.";
        toast.error(message);
      }
    });
  };

  const handleToggleAllItems = async (checked: boolean) => {
    if (!authUser?.id || !localCart) {
      return;
    }

    const previousCart = localCart;

    const nextItems = previousCart.items.map((item) => ({
      ...item,
      is_selected: checked,
    }));

    const nextCart = {
      items: nextItems,
      summary: calculateCartSummary(nextItems),
    };

    syncCartCaches(nextCart);
    setPendingItemIds(nextItems.map((item) => item.id));

    try {
      await Promise.all(
        nextItems.map((item) =>
          updateCartItem({
            user_id: authUser.id,
            cart_id: item.id,
            quantity: item.quantity,
            is_selected: checked,
          })
        )
      );
    } catch (updateError) {
      syncCartCaches(previousCart);

      const message =
        updateError instanceof Error
          ? updateError.message
          : "Gagal memperbarui pilihan item keranjang.";
      toast.error(message);
    } finally {
      setPendingItemIds([]);
    }
  };

  const handleRemoveSelectedItems = async () => {
    if (!localCart) {
      return;
    }

    const selectedCartItems = localCart.items.filter((item) => item.is_selected);

    if (selectedCartItems.length === 0) {
      toast.error("Pilih item yang ingin dihapus dulu.");
      return;
    }

    const previousCart = localCart;

    const nextItems = previousCart.items.filter((item) => !item.is_selected);

    const nextCart = {
      items: nextItems,
      summary: calculateCartSummary(nextItems),
    };

    syncCartCaches(nextCart);
    setPendingItemIds(selectedCartItems.map((item) => item.id));

    try {
      await Promise.all(
        selectedCartItems.map((item) => removeCartItem(item.id))
      );
      toast.success("Item terpilih berhasil dihapus.");
    } catch (removeError) {
      syncCartCaches(previousCart);

      const message =
        removeError instanceof Error
          ? removeError.message
          : "Gagal menghapus item terpilih.";
      toast.error(message);
    } finally {
      setPendingItemIds([]);
    }
  };

  const items = localCart?.items ?? [];
  const summary = localCart?.summary ?? calculateCartSummary(items);
  const selectedItems = items.filter((item) => item.is_selected);
  const selectedSummary = calculateCartSummary(selectedItems);
  const selectedCount = selectedItems.length;
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const hasPendingItems = pendingItemIds.length > 0;

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
              {isLoading
                ? "Memuat keranjang..."
                : `${items.length} item, ${selectedItems.length} dipilih`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-40 animate-pulse rounded-3xl bg-muted"
                  />
                ))}
              </div>

              <div className="h-96 animate-pulse rounded-3xl bg-muted" />
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

              <h2 className="text-2xl font-semibold text-foreground">
                Keranjang kamu masih kosong
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Belum ada produk yang tersimpan di keranjang. Tambahkan produk
                dari katalog dan kembali lagi ke sini untuk melanjutkan
                checkout.
              </p>

              <Button asChild className="mt-6 h-12 rounded-full px-8">
                <Link to="/shop">Mulai belanja</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-border/60 bg-white px-6 py-5 soft-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={isAllSelected}
                        disabled={hasPendingItems}
                        className="h-5 w-5 rounded-md data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                        onCheckedChange={(checked) => {
                          void handleToggleAllItems(checked === true);
                        }}
                      />

                      <div className="flex items-baseline gap-2">
                        <p className="text-md font-semibold text-foreground">
                          Pilih Semua
                        </p>
                        <span className="text-sm text-muted-foreground md:text-base">
                          ({selectedItems.length})
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      disabled={selectedCount === 0 || hasPendingItems}
                      className="h-auto p-0 text-base font-medium text-primary hover:bg-transparent hover:text-primary/80"
                      onClick={() => {
                        void handleRemoveSelectedItems();
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>

                {items.map((item) => {
                  const image = getProductImages(item.product)[0] ?? "";
                  const isPending = pendingItemIds.includes(item.id);
                  const maxQuantity = Math.max(item.product.total_quantity, 1);

                  return (
                    <article
                      key={item.id}
                      className={`overflow-hidden rounded-[1.75rem] border border-border/60 bg-white p-5 soft-shadow transition-opacity md:p-6 ${
                        item.is_selected ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start">
                        <div className="flex min-w-0 flex-1 items-start gap-3 md:gap-4">
                          <Checkbox
                            checked={item.is_selected}
                            disabled={isPending}
                            className="mt-1.5 h-5 w-5 rounded-md data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                            onCheckedChange={(checked) => {
                              void handleCartUpdate(item, {
                                quantity: item.quantity,
                                is_selected: checked === true,
                              });
                            }}
                          />

                          <Link
                            to={`/shop/product/${item.product_unit_id}`}
                            className="block h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-white md:h-28 md:w-28"
                          >
                            <img
                              src={image}
                              alt={item.product.product_name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </Link>

                          <div className="min-w-0 flex-1 pt-1">
                            <Link to={`/shop/product/${item.product_unit_id}`}>
                              <h2 className="line-clamp-2 text-base font-medium leading-snug text-foreground transition-colors hover:text-primary">
                                {item.product.product_name}
                              </h2>
                            </Link>

                            <p className="mt-2 text-sm text-muted-foreground">
                              {item.product.unit_code}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground md:text-sm">
                              <span>
                                Tersisa {item.product.total_quantity}
                              </span>

                              {item.product.discount_flag &&
                              item.product.discount_amount > 0 ? (
                                <span className="line-through">
                                  {formatRupiah(item.product.price)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex min-w-[180px] flex-col items-end gap-4 md:min-w-[200px] md:gap-5">
                          <p className="text-base font-semibold text-foreground md:text-lg">
                            {formatRupiah(item.calculation.final_price)}
                          </p>

                          <div className="flex items-center gap-3 md:gap-4">
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-auto p-0 text-slate-400 hover:bg-transparent hover:text-destructive"
                              disabled={isPending}
                              onClick={() => {
                                void handleRemoveCartItem(item.id);
                              }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>

                            <div className="flex h-10 items-center overflow-hidden rounded-full border border-border/60 bg-white">
                              <button
                                type="button"
                                className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isPending || item.quantity <= 1}
                                onClick={() => {
                                  void handleCartUpdate(item, {
                                    quantity: Math.max(1, item.quantity - 1),
                                    is_selected: item.is_selected,
                                  });
                                }}
                              >
                                <Minus className="h-4 w-4" />
                              </button>

                              <div className="flex h-full min-w-12 items-center justify-center px-3 text-sm font-medium text-foreground md:min-w-14 md:text-base">
                                {item.quantity}
                              </div>

                              <button
                                type="button"
                                className="flex h-full w-10 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isPending || item.quantity >= maxQuantity}
                                onClick={() => {
                                  void handleCartUpdate(item, {
                                    quantity: Math.min(
                                      maxQuantity,
                                      item.quantity + 1
                                    ),
                                    is_selected: item.is_selected,
                                  });
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
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
                      <p className="text-xs uppercase tracking-[0.24em] text-primary">
                        Order Summary
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-foreground">
                        Ringkasan belanja
                      </h2>
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
                      <span className="text-muted-foreground">
                        Subtotal terpilih
                      </span>
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
                        <span className="text-base font-semibold text-foreground">
                          Estimated total
                        </span>
                        <span className="text-xl font-semibold text-foreground">
                          {formatRupiah(selectedSummary.final_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedCount > 0 ? (
                    <Button
                      asChild
                      className="mt-8 h-12 w-full rounded-full text-sm uppercase tracking-[0.16em]"
                    >
                      <Link to="/pre-checkout">Lanjut ke Checkout</Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        disabled
                        className="mt-8 h-12 w-full rounded-full text-sm uppercase tracking-[0.16em]"
                      >
                        Lanjut ke Checkout
                      </Button>

                      <p className="mt-3 text-sm text-muted-foreground">
                        Pilih minimal satu produk sebelum lanjut ke checkout.
                      </p>
                    </>
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