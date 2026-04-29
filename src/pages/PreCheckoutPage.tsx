import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { getAuthUser, hasAccessToken } from "@/lib/auth";
import { getDefaultUserAddress } from "@/lib/address";
import { calculateCartSummary, fetchCart, removeCartItem, type CartItem, type CartResponseData, type DirectCheckoutState } from "@/lib/cart";
import { checkoutTransaction, fetchDeliveryCost } from "@/lib/checkout";
import { formatRupiah, getProductImages } from "@/lib/products";

const ORIGIN_SUBDISTRICT_ID = 19043;
const FALLBACK_DESTINATION_SUBDISTRICT_ID = 212;
const DEFAULT_ITEM_WEIGHT = 1000;

const PAYMENT_METHODS = [
  {
    id: "bank-transfer",
    code: "TRANSFER",
    label: "Bank Transfer",
    description: "Konfirmasi cepat untuk pembayaran via transfer bank.",
    icon: CreditCard,
  },
  {
    id: "virtual-account",
    code: "VIRTUAL_ACCOUNT",
    label: "Virtual Account",
    description: "Bayar praktis dengan nomor VA unik dari bank pilihan.",
    icon: ShieldCheck,
  },
  {
    id: "e-wallet",
    code: "E_WALLET",
    label: "E-Wallet",
    description: "Gunakan dompet digital favoritmu saat checkout final.",
    icon: Store,
  },
];

const COURIERS = [
  { id: "jne", label: "JNE", description: "Jaringan luas untuk pengiriman nasional." },
  { id: "jnt", label: "J&T", description: "Pickup cepat dengan estimasi pengiriman kompetitif." },
];

function resolveReviewItems(items: CartItem[]) {
  return items.filter((item) => item.is_selected);
}

function removeCheckedOutItemsFromCartCache(currentCart: CartResponseData | undefined, checkedOutItemIds: number[]) {
  if (!currentCart) {
    return currentCart;
  }

  const nextItems = currentCart.items.filter((item) => !checkedOutItemIds.includes(item.id));

  return {
    ...currentCart,
    items: nextItems,
    summary: calculateCartSummary(nextItems),
  };
}

const PreCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLoggedIn = hasAccessToken();
  const authUser = getAuthUser();
  const directCheckoutState = location.state as DirectCheckoutState | null;
  const directCheckoutItem = directCheckoutState?.mode === "direct" ? directCheckoutState.item : null;
  const [checkoutStep, setCheckoutStep] = useState<"shipping" | "payment">("shipping");
  const [selectedCourier, setSelectedCourier] = useState(COURIERS[0].id);
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0].id);

  const {
    data: cart,
    isLoading: isCartLoading,
    isError: isCartError,
    error: cartError,
  } = useQuery({
    queryKey: ["pre-checkout-cart"],
    queryFn: fetchCart,
    enabled: isLoggedIn && !directCheckoutItem,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: primaryAddress = null,
    isLoading: isAddressLoading,
    isError: isAddressError,
    error: addressError,
  } = useQuery({
    queryKey: ["pre-checkout-default-address", authUser?.id],
    queryFn: () => getDefaultUserAddress(authUser!.id),
    enabled: isLoggedIn && Boolean(authUser?.id),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const reviewItems = directCheckoutItem
    ? [directCheckoutItem]
    : resolveReviewItems(cart?.items ?? []);
  const destinationSubdistrictId =
    primaryAddress?.subdistrict_id ??
    primaryAddress?.district_id ??
    FALLBACK_DESTINATION_SUBDISTRICT_ID;
  const totalWeight = reviewItems.reduce((total, item) => total + (item.quantity * DEFAULT_ITEM_WEIGHT), 0);

  const {
    data: shippingOptions = [],
    isLoading: isShippingLoading,
    isError: isShippingError,
    error: shippingError,
  } = useQuery({
    queryKey: ["delivery-cost", selectedCourier, destinationSubdistrictId, totalWeight],
    queryFn: () => fetchDeliveryCost({
      origin_subdistrict_id: ORIGIN_SUBDISTRICT_ID,
      destination_subdistrict_id: destinationSubdistrictId!,
      weight: Math.max(totalWeight, DEFAULT_ITEM_WEIGHT),
      courier: selectedCourier,
    }),
    enabled: isLoggedIn && reviewItems.length > 0,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    document.title = "Pre Checkout - Kasta Beaute";
  }, []);

  useEffect(() => {
    if (cartError instanceof Error) {
      toast.error(cartError.message);
    }
  }, [cartError]);

  useEffect(() => {
    if (addressError instanceof Error) {
      toast.error(addressError.message);
    }
  }, [addressError]);

  useEffect(() => {
    if (shippingError instanceof Error) {
      toast.error(shippingError.message);
    }
  }, [shippingError]);

  useEffect(() => {
    if (!shippingOptions.length) {
      setSelectedShippingId("");
      setCheckoutStep("shipping");
      return;
    }

    setSelectedShippingId((current) => {
      if (shippingOptions.some((option) => option.id === current)) {
        return current;
      }

      return shippingOptions[0].id;
    });
  }, [shippingOptions]);

  const selectedPaymentMethodOption =
    PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod) ??
    PAYMENT_METHODS[0];

  const selectedShippingOption =
    shippingOptions.find((option) => option.id === selectedShippingId) ??
    shippingOptions[0] ??
    null;
  const subtotal = calculateCartSummary(reviewItems).final_price;
  const shippingCost = selectedShippingOption?.cost ?? 0;
  const grandTotal = subtotal + shippingCost;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!primaryAddress?.id) {
        throw new Error("Alamat pengiriman belum tersedia.");
      }

      if (!selectedShippingOption) {
        throw new Error("Pilih layanan pengiriman terlebih dahulu.");
      }

      if (!selectedPaymentMethodOption?.code) {
        throw new Error("Metode pembayaran belum tersedia.");
      }

      if (reviewItems.length === 0) {
        throw new Error("Tidak ada item yang bisa di-checkout.");
      }

      return checkoutTransaction({
        user_address_id: primaryAddress.id,
        user_id: authUser.id,
        payment_method_code: selectedPaymentMethodOption.code,
        shipping: {
          name: selectedShippingOption.courierName,
          code: selectedShippingOption.courier,
          service: selectedShippingOption.service,
          description: selectedShippingOption.description,
          cost: selectedShippingOption.cost,
          etd: selectedShippingOption.etd.trim() || "-",
        },
        items: reviewItems.map((item) => ({
          product_id: item.product_id,
          product_detail_id: item.product_detail_id,
          product_unit_id: item.product_unit_id,
          quantity: item.quantity,
        })),
      });
    },
    onSuccess: async () => {
      const checkedOutCartItems = directCheckoutItem
        ? []
        : reviewItems.filter((item) => item.id > 0);
      const checkedOutCartItemIds = checkedOutCartItems.map((item) => item.id);

      if (checkedOutCartItems.length > 0) {
        await Promise.all(checkedOutCartItems.map((item) => removeCartItem(item.id)));
      }

      if (checkedOutCartItemIds.length > 0) {
        queryClient.setQueryData<CartResponseData | undefined>(
          ["pre-checkout-cart"],
          (currentCart) => removeCheckedOutItemsFromCartCache(currentCart, checkedOutCartItemIds),
        );
        queryClient.setQueryData<CartResponseData | undefined>(
          ["cart"],
          (currentCart) => removeCheckedOutItemsFromCartCache(currentCart, checkedOutCartItemIds),
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pre-checkout-cart"] }),
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
      ]);
      toast.success("Checkout berhasil dibuat.");
      navigate("/transactions");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Checkout gagal diproses.");
    },
  });

  if (!isLoggedIn || !authUser?.id) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-luxury pb-14 pt-36 md:pb-16 md:pt-44">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="container relative">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Pre Checkout
            </p>
            <h1 className="font-display text-4xl leading-tight text-balance md:text-5xl lg:text-6xl">
              Confirm <em className="italic gradient-text">Your Order</em>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Review produk, alamat pengiriman, kurir, dan metode pembayaran sebelum masuk ke proses checkout akhir.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke keranjang
            </Link>
            <span className="rounded-full border border-border/60 bg-white px-4 py-2 text-sm text-muted-foreground">
              {isCartLoading ? "Menyiapkan pesanan..." : `${reviewItems.length} produk siap checkout`}
            </span>
          </div>

          {isCartLoading || isAddressLoading ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-48 rounded-3xl bg-muted animate-pulse" />
                ))}
              </div>
              <div className="h-[36rem] rounded-3xl bg-muted animate-pulse" />
            </div>
          ) : isCartError ? (
            <div className="rounded-3xl border border-border/60 bg-white p-8 text-center text-muted-foreground soft-shadow">
              Gagal memuat data checkout. Coba refresh beberapa saat lagi.
            </div>
          ) : reviewItems.length === 0 || (!directCheckoutItem && !cart?.summary) ? (
            <div className="rounded-[2rem] border border-border/60 bg-white px-6 py-14 text-center soft-shadow md:px-12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Tidak ada item untuk checkout</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Pilih produk dari keranjang terlebih dahulu sebelum lanjut ke pre-checkout.
              </p>
              <Button asChild className="mt-6 h-12 rounded-full px-8">
                <Link to="/cart">Kembali ke keranjang</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-border/60 bg-white p-6 soft-shadow md:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Alamat Pengiriman
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="h-10 rounded-full border-border/80 px-6 text-base font-medium text-slate-500 hover:bg-muted text-sm"
                    >
                      <Link to="/profile/addresses">Ubah alamat</Link>
                    </Button>
                  </div>

                  {isAddressError ? (
                    <p className="mt-6 text-sm text-destructive">
                      Gagal memuat alamat. Silakan cek kembali buku alamatmu.
                    </p>
                  ) : !primaryAddress ? (
                    <div className="mt-6 rounded-3xl border border-dashed border-border/80 bg-muted/20 p-6">
                      <p className="text-sm text-muted-foreground">
                        Belum ada alamat utama. Tambahkan atau tandai satu alamat sebagai default sebelum checkout.
                      </p>
                      <Button asChild className="mt-4 rounded-full">
                        <Link to="/profile/addresses">Tambah alamat</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-1 h-5 w-5 shrink-0 fill-primary text-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {primaryAddress.label ? (
                              <p className="text-lg font-semibold text-foreground md:text-lg">
                                {primaryAddress.label} <span className="font-normal">•</span> {primaryAddress.receiver_name}
                              </p>
                            ) : (
                              <p className="text-lg font-semibold text-foreground md:text-lg">
                                {primaryAddress.receiver_name}
                              </p>
                            )}
                          </div>
                          <p className="mt-3 text-base leading-relaxed text-foreground md:text-sm">
                            {primaryAddress.address}, {primaryAddress.subdistrict_name}, {primaryAddress.district_name}, {primaryAddress.city_name}, {primaryAddress.province_name}
                            {primaryAddress.postal_code ? `, ${primaryAddress.postal_code}` : ""}
                          </p>
                          <p className="mt-1 text-base text-foreground md:text-sm">
                            {primaryAddress.phone_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-[2rem] border border-border/60 bg-white p-6 soft-shadow md:p-7">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-primary">Order Items</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">Produk yang dibeli</h2>
                  </div>

                  <div className="mt-6 space-y-4">
                    {reviewItems.map((item) => {
                      const image = getProductImages(item.product)[0] ?? "";
                      const productPrice = item.product.discount_flag ? item.product.final_price : item.product.price;

                      return (
                        <article
                          key={item.id}
                          className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-white p-5"
                        >
                          <div className="flex flex-col gap-5 md:flex-row">
                            <Link
                              to={`/shop/product/${item.product_unit_id}`}
                              className="block w-full overflow-hidden rounded-2xl bg-gradient-nude md:w-36"
                            >
                              <img
                                src={image}
                                alt={item.product.product_name}
                                className="aspect-square h-full w-full object-cover"
                                loading="lazy"
                              />
                            </Link>

                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-[11px] uppercase tracking-[0.24em] text-primary">
                                    {item.product.category_name}
                                  </p>
                                  <h3 className="mt-1 line-clamp-2 text-base font-medium leading-tight text-foreground">
                                    {item.product.product_name}
                                  </h3>
                                </div>
                                <div className="text-right">
                                  <p className="text-base font-semibold text-foreground">
                                    {formatRupiah(item.calculation.final_price)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty {item.quantity}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
                                  {item.product.unit_code}
                                </span>
                                <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
                                  {DEFAULT_ITEM_WEIGHT * item.quantity} gr
                                </span>
                                <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
                                  {formatRupiah(productPrice)} / item
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>

              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[2rem] border border-border/60 bg-white p-6 soft-shadow md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-primary">Checkout Setup</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 p-1">
                      <button
                        type="button"
                        className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
                          checkoutStep === "shipping"
                            ? "bg-foreground text-background"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => setCheckoutStep("shipping")}
                      >
                        Ongkir
                      </button>
                      <button
                        type="button"
                        className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
                          checkoutStep === "payment"
                            ? "bg-foreground text-background"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => selectedShippingOption && setCheckoutStep("payment")}
                        disabled={!selectedShippingOption}
                      >
                        Pembayaran
                      </button>
                    </div>
                  </div>

                  {checkoutStep === "shipping" ? (
                    <>
                      <section className="mt-8">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-base font-semibold text-foreground">Courier</h3>
                          <Truck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="mt-4 grid gap-3">
                          {COURIERS.map((courier) => (
                            <button
                              key={courier.id}
                              type="button"
                              className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                                selectedCourier === courier.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border/60 hover:border-primary/40"
                              }`}
                              onClick={() => setSelectedCourier(courier.id)}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-foreground">{courier.label}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">{courier.description}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="mt-8">
                        {isShippingLoading ? (
                          <div className="flex justify-end">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        ) : null}

                        {isShippingError ? (
                          <p className="mt-4 text-sm text-destructive">
                            Gagal menghitung ongkir untuk courier ini.
                          </p>
                        ) : shippingOptions.length === 0 ? (
                          <p className="mt-4 text-sm text-muted-foreground">
                            Tidak ada layanan pengiriman yang tersedia untuk courier ini.
                          </p>
                        ) : (
                          <RadioGroup
                            className="mt-4 gap-3"
                            value={selectedShippingId}
                            onValueChange={setSelectedShippingId}
                          >
                            {shippingOptions.map((option) => (
                              <label
                                key={option.id}
                                htmlFor={option.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                                  selectedShippingId === option.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border/60 hover:border-primary/40"
                                }`}
                              >
                                <RadioGroupItem id={option.id} value={option.id} className="mt-1" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="font-semibold text-foreground">
                                        {option.courierName} {option.service}
                                      </p>
                                      <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-foreground">{formatRupiah(option.cost)}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Est. {option.etd || "Tersedia"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                        )}
                      </section>
                    </>
                  ) : (
                    <section className="mt-8">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-foreground">Payment method</h3>
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <RadioGroup
                        className="mt-4 gap-3"
                        value={selectedPaymentMethod}
                        onValueChange={setSelectedPaymentMethod}
                      >
                        {PAYMENT_METHODS.map((method) => {
                          const Icon = method.icon;

                          return (
                            <label
                              key={method.id}
                              htmlFor={method.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                                selectedPaymentMethod === method.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border/60 hover:border-primary/40"
                              }`}
                            >
                              <RadioGroupItem id={method.id} value={method.id} className="mt-1" />
                              <div className="flex min-w-0 flex-1 items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{method.label}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">{method.description}</p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </RadioGroup>
                    </section>
                  )}

                  <Separator className="my-8" />

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Subtotal produk</span>
                      <span className="font-medium text-foreground">{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Ongkir</span>
                      <span className="font-medium text-foreground">
                        {selectedShippingOption ? formatRupiah(shippingCost) : "Pilih layanan"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Berat total</span>
                      <span className="font-medium text-foreground">{Math.max(totalWeight, 0)} gr</span>
                    </div>
                    <div className="border-t border-border/60 pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-base font-semibold text-foreground">Total pembayaran</span>
                        <span className="text-xl font-semibold text-foreground">
                          {formatRupiah(grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {checkoutStep === "shipping" ? (
                    <Button
                      className="mt-8 h-12 w-full rounded-full text-sm uppercase tracking-[0.16em]"
                      disabled={!primaryAddress || !selectedShippingOption}
                      onClick={() => setCheckoutStep("payment")}
                    >
                      Next ke Pembayaran
                    </Button>
                  ) : (
                    <div className="mt-8 flex gap-3">
                      <Button
                        variant="outline"
                        className="h-12 flex-1 rounded-full text-sm uppercase tracking-[0.16em]"
                        onClick={() => setCheckoutStep("shipping")}
                      >
                        Kembali
                      </Button>
                      <Button
                        className="h-12 flex-1 rounded-full text-sm uppercase tracking-[0.16em]"
                        disabled={!primaryAddress || !selectedShippingOption || checkoutMutation.isPending}
                        onClick={() => checkoutMutation.mutate()}
                      >
                        {checkoutMutation.isPending ? "Memproses..." : "Lanjut Bayar"}
                      </Button>
                    </div>
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

export default PreCheckoutPage;
