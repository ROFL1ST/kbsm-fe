import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Store,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
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
  const productUnitId = Number(params.productUnitId);
  const mobileGalleryRef = useRef<HTMLDivElement | null>(null);
  const [activeMobileSlide, setActiveMobileSlide] = useState(0);

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
    queryKey: ["related-products", product?.category_id],
    queryFn: () =>
      fetchProducts({
        categoryId: product!.category_id,
        size: 5,
      }),
    select: (items) =>
      items
        .filter((item) => item.product_unit_id !== productUnitId)
        .map(mapProductToCard),
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

  useEffect(() => {
    setActiveMobileSlide(0);
  }, [productUnitId]);

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
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <div className="flex h-full w-14 items-center justify-center border-x border-border/60 font-medium">
                            1
                          </div>
                          <button
                            type="button"
                            className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted"
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
                    >
                      Beli Langsung
                    </Button>
                    <Button className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                      + Tambahkan ke Keranjang
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

              {/* <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl border border-border/60 bg-white p-6 soft-shadow md:p-8">
                  <h2 className="text-lg font-semibold text-foreground">
                    Detail Produk
                  </h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Kategori</p>
                      <p className="mt-1 font-medium text-foreground">
                        {product.category_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kode Produk</p>
                      <p className="mt-1 font-medium text-foreground">{product.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satuan</p>
                      <p className="mt-1 font-medium text-foreground">
                        {product.unit_code}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Best Seller</p>
                      <p className="mt-1 font-medium text-foreground">
                        {product.is_best_seller ? "Ya" : "Tidak"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-white p-6 soft-shadow md:p-8">
                  <h2 className="text-lg font-semibold text-foreground">
                    Informasi Singkat
                  </h2>
                  <div className="mt-5 grid gap-3">
                    {[
                      "Harga dan gambar langsung dari API produk",
                      "Deskripsi mendukung format HTML dari backend",
                      "Layout atas mengikuti pola marketplace",
                      "Gambar utama dipertahankan tetap dominan",
                    ].map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ShoppingBag className="h-3 w-3" />
                        </span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div> */}

              <div className="rounded-2xl border border-border/60 bg-white p-6 soft-shadow md:p-8">
                <h2 className="text-lg font-semibold text-foreground">
                  Deskripsi Produk
                </h2>
                <div
                  className="prose-blog mt-5 max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.product_description }}
                />
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground md:text-2xl">
                      Produk Terkait
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Produk lain dalam kategori {product.category_name}
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Lihat semua
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
                ) : null}
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
            >
              Beli Langsung
            </Button>
            <Button className="h-12 w-full rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground hover:bg-primary/90">
              + Keranjang
            </Button>
          </div>
        </div>
      ) : null}
      <WhatsAppFloat className="bottom-24 md:bottom-6" />
    </main>
  );
};

export default ProductDetail;
