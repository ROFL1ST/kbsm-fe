import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { hasAccessToken } from "@/lib/auth";
import {
  calculateCartSummary,
  fetchCart,
  removeCartItem,
  updateCartItem,
  updateCartItemLocally,
  type CartItem,
  type CartResponseData,
} from "@/lib/cart";
import { formatRupiah, getProductImages } from "@/lib/products";
import { cn } from "@/lib/utils";

const CartPage = () => {
  const isLoggedIn = hasAccessToken();
  const queryClient = useQueryClient();
  const [pendingCartItemIds, setPendingCartItemIds] = useState<number[]>([]);

  const setPendingState = (cartItemId: number, isPending: boolean) => {
    setPendingCartItemIds((current) => {
      if (isPending) {
        return current.includes(cartItemId) ? current : [...current, cartItemId];
      }

      return current.filter((id) => id !== cartItemId);
    });
  };

  const updateCartCaches = (
    updater: (currentCart: CartResponseData | undefined) => CartResponseData | undefined,
  ) => {
    queryClient.setQueryData<CartResponseData | undefined>(["cart"], updater);
    queryClient.setQueryData<CartResponseData | undefined>(["navbar-cart"], updater);
    queryClient.setQueryData<CartResponseData | undefined>(["pre-checkout-cart"], updater);
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
    onMutate: async (variables) => {
      const targetId = variables.cart_id;
      setPendingState(targetId, true);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["cart"] }),
        queryClient.cancelQueries({ queryKey: ["navbar-cart"] }),
        queryClient.cancelQueries({ queryKey: ["pre-checkout-cart"] }),
      ]);

      const previousCart = queryClient.getQueryData<CartResponseData>(["cart"]);
      const previousNavbarCart = queryClient.getQueryData<CartResponseData>(["navbar-cart"]);
      const previousPreCheckoutCart =
        queryClient.getQueryData<CartResponseData>(["pre-checkout-cart"]);

      updateCartCaches((currentCart) => {
        if (!currentCart) {
          return currentCart;
        }

        const nextItems = currentCart.items.map((item) =>
          item.id === targetId ? updateCartItemLocally(item, variables) : item,
        );

        return {
          ...currentCart,
          items: nextItems,
          summary: calculateCartSummary(nextItems),
        };
      });

      return {
        previousCart,
        previousNavbarCart,
        previousPreCheckoutCart,
      };
    },
    onError: (mutationError, _variables, context) => {
      if (context) {
        queryClient.setQueryData(["cart"], context.previousCart);
        queryClient.setQueryData(["navbar-cart"], context.previousNavbarCart);
        queryClient.setQueryData(["pre-checkout-cart"], context.previousPreCheckoutCart);
      }

      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal memperbarui keranjang.";
      toast.error(message);
    },
    onSettled: (_data, _error, variables) => {
      setPendingState(variables.cart_id, false);
    },
  });

  const removeCartMutation = useMutation({
    mutationFn: removeCartItem,
    onMutate: async (cartItemId) => {
      setPendingState(cartItemId, true);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["cart"] }),
        queryClient.cancelQueries({ queryKey: ["navbar-cart"] }),
        queryClient.cancelQueries({ queryKey: ["pre-checkout-cart"] }),
      ]);

      const previousCart = queryClient.getQueryData<CartResponseData>(["cart"]);
      const previousNavbarCart = queryClient.getQueryData<CartResponseData>(["navbar-cart"]);
      const previousPreCheckoutCart =
        queryClient.getQueryData<CartResponseData>(["pre-checkout-cart"]);

      updateCartCaches((currentCart) => {
        if (!currentCart) {
          return currentCart;
        }

        const nextItems = currentCart.items.filter((item) => item.id !== cartItemId);

        return {
          ...currentCart,
          items: nextItems,
          summary: calculateCartSummary(nextItems),
        };
      });

      return {
        previousCart,
        previousNavbarCart,
        previousPreCheckoutCart,
        cartItemId,
      };
    },
    onError: (mutationError, _cartItemId, context) => {
      if (context) {
        queryClient.setQueryData(["cart"], context.previousCart);
        queryClient.setQueryData(["navbar-cart"], context.previousNavbarCart);
        queryClient.setQueryData(["pre-checkout-cart"], context.previousPreCheckoutCart);
      }

      const message =
        mutationError instanceof Error ? mutationError.message : "Gagal menghapus item keranjang.";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Item berhasil dihapus dari keranjang.");
    },
    onSettled: (_data, _error, cartItemId) => {
      setPendingState(cartItemId, false);
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
  const selectedItems = items.filter((item) => item.is_selected);
  const selectedSummary = calculateCartSummary(selectedItems);
  const selectedCount = selectedItems.length;
  const allItemsSelected = items.length > 0 && selectedCount === items.length;
  const isCartUpdating = updateCartMutation.isPending || removeCartMutation.isPending;

  const handleSelectAll = async (checked: boolean) => {
    if (items.length === 0) {
      return;
    }

    try {
      await Promise.all(
        items.map((item) =>
          updateCartMutation.mutateAsync({
            cart_id: item.id,
            quantity: item.quantity,
            is_selected: checked,
          }),
        )
      );
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Gagal memperbarui pilihan produk.";
      toast.error(message);
    }
  };

  const handleItemSelection = (item: CartItem, checked: boolean) => {
    updateCartMutation.mutate({
      cart_id: item.id,
      quantity: item.quantity,
      is_selected: checked,
    });
  };

  const handleQuantityChange = (item: CartItem, nextQuantity: number) => {
    if (nextQuantity === item.quantity || nextQuantity <= 0) {
      return;
    }

    updateCartMutation.mutate({
      cart_id: item.id,
      quantity: nextQuantity,
      is_selected: item.is_selected,
    });
  };

  const handleRemoveItem = (item: CartItem) => {
    removeCartMutation.mutate(item.id);
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
          ) : items.length === 0 ? (
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
                <div className="rounded-[2rem] border border-border/60 bg-white soft-shadow p-4">
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={allItemsSelected}
                      disabled={isCartUpdating}
                      onCheckedChange={(checked) => handleSelectAll(checked === true)}
                      className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                    <span className="text-sm font-medium text-foreground md:text-sm">
                      Pilih Semua ({items.length})
                    </span>
                  </label>
                </div>

                {items.map((item) => {
                  const image = getProductImages(item.product)[0] ?? "";
                  const productPrice = item.product.discount_flag
                    ? item.product.final_price
                    : item.product.price;
                  const isItemUpdating = pendingCartItemIds.includes(item.id);
                  const maxQuantity = Math.max(
                    item.quantity,
                    item.product.total_quantity || item.quantity
                  );

                  return (
                    <article
                      key={item.id}
                      className={cn(
                        "rounded-[2rem] border border-border/60 bg-white p-4 soft-shadow transition-opacity",
                        !item.is_selected && "opacity-75"
                      )}
                    >
                      <div className="flex items-start gap-4 md:gap-5">
                        <div className="pt-2">
                          <Checkbox
                            checked={item.is_selected}
                            disabled={isItemUpdating}
                            onCheckedChange={(checked) =>
                              handleItemSelection(item, checked === true)
                            }
                                                  className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary"

                            // className="h-7 w-7 rounded-md border-slate-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                          />
                        </div>

                        <Link
                          to={`/shop/product/${item.product_unit_id}`}
                          className="block h-24 w-24 shrink-0 overflow-hidden rounded-[1.5rem] border border-border/60 bg-white md:h-28 md:w-28"
                        >
                          <img
                            src={image}
                            alt={item.product.product_name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 max-w-3xl">
                              <Link to={`/shop/product/${item.product_unit_id}`}>
                                <h2 className="line-clamp-2 text-sm font-medium leading-relaxed text-foreground transition-colors hover:text-primary">
                                  {item.product.product_name}
                                </h2>
                              </Link>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {item.product.category_name}
                              </p>
                            </div>

                            <div className="shrink-0 text-left md:min-w-40 md:text-right">
                              <p className="text-sm font-medium text-foreground md:text-sm">
                                {formatRupiah(item.calculation.final_price)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-col gap-4 border-t border-border/60 pt-4 md:flex-row md:items-end md:justify-between">
                            <div className="flex min-h-10 items-center">
                              {item.product.discount_flag && item.product.discount_amount > 0 ? (
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">
                                    {formatRupiah(productPrice)}
                                  </span>
                                  <span className="line-through">
                                    {formatRupiah(item.product.price)}
                                  </span>
                                  <span className="text-primary">
                                    Hemat {formatRupiah(item.calculation.discount_amount)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Harga satuan {formatRupiah(productPrice)}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 md:justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item)}
                                disabled={isItemUpdating}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Hapus ${item.product.product_name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                              <div className="flex h-10 items-center overflow-hidden rounded-full border border-border/60 bg-white">
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
                                <div className="flex h-full min-w-12 items-center justify-center border-x border-border/60 px-3 text-sm font-medium text-foreground">
                                  {item.quantity}
                                </div>
                                <button
                                  type="button"
                                  className="flex h-full w-10 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
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
