import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORY_CACHE_TTL, fetchCategories } from "@/lib/categories";

const INFO_COLUMNS = [
  {
    title: "Customer Care",
    links: ["Contact Us", "FAQs", "Shipping Info", "Returns", "Track Order"],
  },
  {
    title: "Policies",
    links: [
      "Privacy Policy",
      "Terms of Service",
      "Refund Policy",
      "Cookie Policy",
    ],
  },
];

const PAYMENT_METHODS = ["Mandiri"];

const SHIPPING_PARTNERS = ["JNT", "JNE"];

const Footer = () => {
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: CATEGORY_CACHE_TTL,
    gcTime: CATEGORY_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const shouldSplitCategories = categories.length > 6;
  const midpoint = Math.ceil(categories.length / 2);

  const categoryColumns = shouldSplitCategories
    ? [categories.slice(0, midpoint), categories.slice(midpoint)]
    : [categories];

  return (
    <footer id="contact" className="bg-foreground pb-8 pt-20 text-background">
      <div className="container">
        <div className="grid gap-10 border-b border-background/10 pb-16 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-4">
            <Link
              to="/"
              className="inline-block font-display text-3xl font-semibold"
            >
              Kasta<span className="text-primary-glow italic">Beaute</span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-background/60">
              Premium skincare yang menggabungkan ilmu pengetahuan modern dengan
              kekuatan alam, diciptakan untuk kulit sehat, glowing, dan terawat.
            </p>

            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label="social"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-background/20 transition-colors hover:border-primary hover:bg-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:col-span-8">
            <div>
              <h4 className="mb-4 font-display text-base text-primary-glow">
                Shop
              </h4>

              {isCategoriesError ? (
                <p className="text-sm text-background/60">
                  Gagal memuat kategori.
                </p>
              ) : (
                <div
                  className={`grid gap-6 ${
                    shouldSplitCategories
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {isCategoriesLoading && categories.length === 0
                    ? Array.from({
                        length: shouldSplitCategories ? 2 : 1,
                      }).map((_, columnIndex) => (
                        <ul key={columnIndex} className="space-y-3">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <li
                              key={index}
                              className="h-4 w-24 animate-pulse rounded bg-background/10"
                            />
                          ))}
                        </ul>
                      ))
                    : categoryColumns.map((column, columnIndex) => (
                        <ul key={columnIndex} className="space-y-3">
                          {column.map((category) => (
                            <li key={category.id}>
                              <Link
                                to={`/shop?category_id=${category.id}`}
                                className="text-sm text-background/60 transition-colors hover:text-background"
                              >
                                {category.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ))}
                </div>
              )}
            </div>

            {INFO_COLUMNS.map((column) => (
              <div key={column.title}>
                <h4 className="mb-4 font-display text-base text-primary-glow">
                  {column.title}
                </h4>

                <ul className="space-y-3">
                  {column.links.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-background/60 transition-colors hover:text-background"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 border-b border-background/10 py-8 text-xs md:grid-cols-2">
          <div>
            <p className="mb-3 uppercase tracking-[0.2em] text-background/40">
              We Accept
            </p>

            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((payment) => (
                <span
                  key={payment}
                  className="rounded-md border border-background/10 bg-background/5 px-3 py-1.5 text-background/70"
                >
                  {payment}
                </span>
              ))}
            </div>
          </div>

          <div className="md:text-right">
            <p className="mb-3 uppercase tracking-[0.2em] text-background/40">
              Shipping Partners
            </p>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {SHIPPING_PARTNERS.map((partner) => (
                <span
                  key={partner}
                  className="rounded-md border border-background/10 bg-background/5 px-3 py-1.5 text-background/70"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-xs text-background/40 md:flex-row">
          <p>© 2026 Kasta Beaute. All Rights Reserved.</p>
          <p>Crafted with care in Indonesia • BPOM Certified • Cruelty Free</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;