import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Store,
  Sparkles,
  PackageSearch,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LoginRequiredDialog from "@/components/LoginRequiredDialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { getAuthUser, hasAccessToken } from "@/lib/auth";
import { addToCart, createCartItemFromProduct, type DirectCheckoutState } from "@/lib/cart";
import {
  fetchProducts,
  fetchProductDetail,
  formatRupiah,
  getProductImages,
  mapProductToCard,
  PRODUCT_CACHE_TTL,
} from "@/lib/products";

const ProductDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const productUnitId = Number(params.productUnitId);
  const mobileGalleryRef = useRef<HTMLDivElement | null>(null);
  const [activeMobileSlide, setActiveMobileSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-detail", productUnitId],
    queryFn: () => fetchProductDetail(productUnitId),
    enabled:
      Number.isInteger(productUnitId) &&
      productUnitId > 0,
    staleTime: PRODUCT_CACHE_TTL,
    gcTime: PRODUCT_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: relatedProducts = [],
    isLoading: isRelatedLoading,
  } = useQuery({
    queryKey: ["related-products", product?.category_id, productUnitId],
    queryFn: () =>
      fetchProducts({
        categoryId: product!.category_id,
        productUnitId,
        size: 10,
        page: 1,
      }),
    select: (items) => items.map(mapProductToCard),
    enabled: typeof product?.category_id === "number" && product.category_id > 0,
    staleTime: PRODUCT_CACHE_TTL,
    gcTime: PRODUCT_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    document.title = product
      ? `${product.product_name} - Kasta Beaute`
      : "Detail Produk - Kasta Beaute";
  }, [product]);

  const cardProduct = product ? mapProductToCard(product) : null;
  const productImages = product ? getProductImages(product) : [];
  const discountValue =
    product && product.discount_flag ? product.discount_amount : 0;
  const discountPercentage =
    product && product.discount_flag && product.price > 0
      ? Math.round((product.discount_amount / product.price) * 100)
      : 0;
  const mobileSlides = productImages.length > 0 ? productImages : cardProduct ? [cardProduct.image] : [];
  const activeImage = mobileSlides[activeMobileSlide] ?? cardProduct?.image ?? "";
  const authUser = getAuthUser();

  const shopByCategoryLink = product?.category_id
    ? `/shop?category_id=${product.category_id}`
    : "/shop";

  useEffect(() => {
    setActiveMobileSlide(0);
    setQuantity(1);
  }, [productUnitId]);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product || !cardProduct) {
        throw new Error("Produk tidak tersedia.");
      }

      if (!hasAccessToken()) {
        throw new Error("Kamu harus login dulu sebelum menambahkan produk ke keranjang.");
      }

      if (quantity <= 0) {
        throw new Error("Quantity produk harus lebih dari 0.");
      }

      await addToCart({
        product_unit_id: product.product_unit_id,
        quantity,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
        queryClient.invalidateQueries({ queryKey: ["navbar-cart"] }),
        queryClient.invalidateQueries({ queryKey: ["pre-checkout-cart"] }),
      ]);
      toast.success("Produk berhasil ditambahkan ke keranjang.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Gagal menambahkan produk ke keranjang.";
      toast.error(message);
      if (message.includes("login")) {
        setLoginPromptOpen(true);
      }
    },
  });

  const handleAddToCart = () => {
    if (!hasAccessToken()) {
      setLoginPromptOpen(true);
      return;
    }

    addToCartMutation.mutate();
  };

  const handleMobileGalleryScroll = () => {
    if (!mobileGalleryRef.current) {
      return;
    }

    const { scrollLeft, clientWidth } = mobileGalleryRef.current;

    if (clientWidth === 0) {
      return;
    }

    setActiveMobileSlide(Math.round(scrollLeft / clientWidth));
  };

  const goToMobileSlide = (index: number) => {
    if (!mobileGalleryRef.current) {
      return;
    }

    mobileGalleryRef.current.scrollTo({
      left: mobileGalleryRef.current.clientWidth * index,
      behavior: "smooth",
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    if (!product) {
      return;
    }

    setQuantity((current) => Math.min(product.total_quantity, current + 1));
  };

  const handleBuyNow = () => {
    if (!product) {
      toast.error("Produk tidak tersedia.");
      return;
    }

    if (!hasAccessToken()) {
      toast.error("Kamu harus login dulu sebelum melanjutkan checkout.");
      navigate("/login");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity produk harus lebih dari 0.");
      return;
    }

    const directCheckoutState: DirectCheckoutState = {
      mode: "direct",
      item: createCartItemFromProduct(product, quantity, authUser?.id ?? ""),
    };

    navigate("/pre-checkout", {
      state: directCheckoutState,
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-background pb-40 pt-32 md:pb-20 md:pt-36">
        <div className="container space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/shop" className="transition-colors hover:text-foreground">
              Shop All
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="line-clamp-1 text-primary">{product?.product_name ?? "Detail Produk"}</span>
          </div>

          {isError ? (
            <div className="rounded-3xl border border-border/60 bg-white p-8 text-center text-muted-foreground soft-shadow">
              Gagal memuat detail produk. Coba refresh beberapa saat lagi.
            </div>
          ) : isLoading ? (
            <div className="grid gap-6 lg:grid-cols-[84px_minmax(0,1fr)_minmax(340px,420px)]">
              <div className="hidden gap-3 lg:grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/5] rounded-xl bg-muted animate-pulse"
                  />
                ))}
              </div>
              <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
              <div className="space-y-4">
                <div className="h-20 rounded-2xl bg-muted animate-pulse" />
                <div className="h-14 rounded-2xl bg-muted animate-pulse" />
                <div className="h-12 w-28 rounded-xl bg-muted animate-pulse" />
                <div className="h-14 w-44 rounded-xl bg-muted animate-pulse" />
                <div className="h-40 rounded-2xl bg-muted animate-pulse" />
              </div>
            </div>
          ) : !product || !cardProduct ? (
            <div className="rounded-3xl border border-border/60 bg-white p-8 text-center text-muted-foreground soft-shadow">
              Produk tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-[84px_minmax(0,1fr)_minmax(340px,420px)] lg:items-start">
                <div className="hidden gap-3 lg:grid">
                  {mobileSlides.map((slide, index) => (
                    <button
                      key={`${slide}-${index}`}
                      type="button"
                      className={`overflow-hidden rounded-xl border bg-white ${
                        index === activeMobileSlide ? "border-primary" : "border-border/60"
                      }`}
                      onClick={() => setActiveMobileSlide(index)}
                    >
                      <img
                        src={slide}
                        alt={`${cardProduct.name} preview ${index + 1}`}
                        className="aspect-[4/5] h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <div className="mx-auto w-full max-w-[620px] overflow-hidden rounded-2xl border border-border/60 bg-white">
                  <div className="relative hidden bg-gradient-to-br from-primary/10 via-white to-primary/5 md:block">
                    <img
                      src={activeImage}
                      alt={cardProduct.name}
                      width={1200}
                      height={1200}
                      className="aspect-square w-full object-cover"
                    />
                  </div>

                  <div className="relative md:hidden">
                    <div
                      ref={mobileGalleryRef}
                      className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      onScroll={handleMobileGalleryScroll}
                    >
                      {mobileSlides.map((slide, index) => (
                        <div
                          key={`${slide}-${index}`}
                          className="w-full shrink-0 snap-center bg-gradient-to-br from-primary/10 via-white to-primary/5"
                        >
                          <img
                            src={slide}
                            alt={`${cardProduct.name} ${index + 1}`}
                            width={1200}
                            height={1200}
                            className="aspect-square w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
                      {mobileSlides.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          aria-label={`Slide ${index + 1}`}
                          className={`h-3 w-3 rounded-full transition-all ${
                            index === activeMobileSlide
                              ? "bg-white"
                              : "bg-white/55"
                          }`}
                          onClick={() => goToMobileSlide(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-border/60 pb-4 md:hidden">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-base text-foreground transition-colors hover:text-primary"
                  >
                    <Store className="h-5 w-5" />
                    Beli Offline
                  </button>

                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      className="text-foreground transition-colors hover:text-primary"
                      aria-label="Bagikan Produk"
                    >
                      <Share2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h1 className="text-2xl font-semibold leading-snug text-foreground md:text-3xl">
                      {product.product_name}
                    </h1>
                  </div>

                  <div className="rounded-2xl bg-primary/5 p-5">
                    <div className="flex flex-wrap items-end gap-3">
                      <span className="text-2xl font-semibold text-primary md:text-3xl">
                        {formatRupiah(cardProduct.price)}
                      </span>
                      {cardProduct.oldPrice && (
                        <div className="flex items-center gap-2 pb-1">
                          <span className="text-base text-muted-foreground line-through">
                            {formatRupiah(cardProduct.oldPrice)}
                          </span>
                          {discountPercentage > 0 && (
                            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {discountPercentage}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {discountValue > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Hemat {formatRupiah(discountValue)}
                      </p>
                    )}
                  </div>

                  <div className="hidden space-y-4 md:block">
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">Ukuran</p>
                      <div className="inline-flex rounded-full border border-primary/25 px-4 py-2 text-sm font-medium text-primary">
                        {product.unit_code}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">Jumlah</p>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 items-center overflow-hidden rounded-xl border border-border/60 bg-white">
                          <button
                            type="button"
                            className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted"
                            onClick={decreaseQuantity}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <div className="flex h-full w-14 items-center justify-center border-x border-border/60 font-medium">
                            {quantity}
                          </div>
                          <button
                            type="button"
                            className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted"
                            onClick={increaseQuantity}
                            disabled={quantity >= product.total_quantity}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Tersisa {product.total_quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden space-y-3 md:block">
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-xl border-foreground/20 bg-white text-foreground hover:bg-muted"
                      onClick={handleBuyNow}
                    >
                      Beli Langsung
                    </Button>
                    <Button
                      className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending || product.total_quantity <= 0}
                    >
                      {addToCartMutation.isPending ? "Menambahkan..." : "+ Tambahkan ke Keranjang"}
                    </Button>
                  </div>

                  <div className="hidden grid-cols-3 gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground md:grid">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 transition-colors hover:text-primary"
                    >
                      <Store className="h-4 w-4" />
                      Beli offline
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 transition-colors hover:text-primary"
                    >
                      <Share2 className="h-4 w-4" />
                      Bagikan Produk
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-6 soft-shadow md:p-8">
                <h2 className="text-lg font-semibold text-foreground">
                  Deskripsi Produk
                </h2>
                <div
                  className="prose-blog mt-5 max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.product_description }}
                />
              </div>

              {/* ── Produk Terkait ── */}
              <div className="border-t border-border/60 pt-8">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium tracking-widest text-primary uppercase">
                      <Sparkles className="h-3 w-3" />
                      Mungkin Kamu Suka
                    </div>
                    <h2 className="text-lg font-semibold text-foreground md:text-2xl">
                      Produk Terkait
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Produk lain dalam kategori{" "}
                      <span className="font-medium text-foreground">{product.category_name}</span>
                    </p>
                  </div>
                  <Link
                    to={shopByCategoryLink}
                    className="shrink-0 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Lihat semua →
                  </Link>
                </div>

                {isRelatedLoading ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="aspect-[3/4] rounded-3xl bg-muted animate-pulse"
                      />
                    ))}
                  </div>
                ) : relatedProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {relatedProducts.map((relatedProduct) => (
                      <ProductCard key={relatedProduct.id} p={relatedProduct} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-muted/30 py-14 text-center">
                    <PackageSearch className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Belum ada produk lain dalam kategori ini
                    </p>
                    <Link
                      to="/shop"
                      className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Jelajahi semua produk →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      {product && cardProduct && !isLoading && !isError ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
          <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 w-full rounded-none border-foreground bg-white px-4 text-base font-semibold text-foreground hover:bg-muted"
              onClick={handleBuyNow}
            >
              Beli Langsung
            </Button>
            <Button
              className="h-12 w-full rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || product.total_quantity <= 0}
            >
              {addToCartMutation.isPending ? "Menambahkan..." : "+ Keranjang"}
            </Button>
          </div>
        </div>
      ) : null}
      <LoginRequiredDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
        productName={cardProduct?.name}
      />
      <WhatsAppFloat className="bottom-24 md:bottom-6" />
    </main>
  );
};

export default ProductDetail;
