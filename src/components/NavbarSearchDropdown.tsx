import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  mapProductToCard,
  formatRupiah,
  PRODUCT_CACHE_TTL,
} from "@/lib/products";

interface NavbarSearchDropdownProps {
  query: string;
  onClose: () => void;
}

const NavbarSearchDropdown = ({ query, onClose }: NavbarSearchDropdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["navbar-search", query],
    queryFn: () => fetchProducts({ search: query, size: 6 }),
    select: (items) => items.map(mapProductToCard).slice(0, 6),
    enabled: query.trim().length >= 2,
    staleTime: PRODUCT_CACHE_TTL,
    refetchOnWindowFocus: false,
  });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (query.trim().length < 2) return null;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-full mt-2 z-50 animate-fade-in"
    >
      <div className="container">
        <div className="glass-card overflow-hidden rounded-2xl">
          {/* Loading skeleton */}
          {isLoading && (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded-full bg-muted animate-pulse" />
                    <div className="h-3 w-1/3 rounded-full bg-muted animate-pulse" />
                  </div>
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <Search className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm">
                Tidak ada produk untuk{" "}
                <span className="font-medium text-foreground">"{query}"</span>
              </p>
            </div>
          )}

          {/* Product list */}
          {!isLoading && products.length > 0 && (
            <>
              <ul className="divide-y divide-border/50">
                {products.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/shop/product/${product.id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/60 transition-colors group"
                    >
                      {/* Product image */}
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-nude">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            width={56}
                            height={56}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Search className="h-5 w-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary mb-0.5">
                          {product.category}
                        </p>
                        <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold font-display text-foreground">
                          {formatRupiah(product.price)}
                        </p>
                        {product.oldPrice && (
                          <p className="text-[11px] text-muted-foreground line-through">
                            {formatRupiah(product.oldPrice)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Footer: see all results */}
              <Link
                to={`/shop?search=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-medium text-primary hover:bg-accent/40 transition-colors border-t border-border/50 group"
              >
                Lihat semua hasil untuk{" "}
                <span className="italic">"{query}"</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavbarSearchDropdown;
