import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import {
  BLOGS_CACHE_TTL,
  DEFAULT_BLOG_PAGE_SIZE,
  fetchBlogCategories,
  fetchBlogs,
  formatBlogDate,
  type BlogCategory,
  type BlogPost,
} from "@/lib/blogs";
import { cn } from "@/lib/utils";

const EMPTY_BLOGS: BlogPost[] = [];

const BlogCard = ({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) => (
  <article
    className={cn(
      "group flex flex-col overflow-hidden rounded-3xl bg-card soft-shadow hover-lift",
      featured && "md:col-span-2 md:flex-row"
    )}
  >
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-gradient-nude",
        featured ? "aspect-video md:aspect-auto md:w-1/2" : "aspect-video"
      )}
    >
      {post.featured ? (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-foreground px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-background">
          Featured
        </span>
      ) : null}

      <img
        src={post.image}
        alt={post.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>

    <div
      className={cn(
        "flex flex-1 flex-col gap-3 p-6",
        featured && "md:justify-center md:p-8"
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
        {post.category}
      </span>

      <Link
        to={`/blog/${post.slug}`}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-4"
      >
        <h3
          className={cn(
            "font-display leading-tight transition-colors duration-300 hover:text-primary group-hover:text-primary",
            featured ? "text-2xl md:text-3xl" : "line-clamp-2 text-lg"
          )}
        >
          {post.title}
        </h3>
      </Link>

      <p
        className={cn(
          "text-sm leading-relaxed text-muted-foreground",
          featured ? "line-clamp-3" : "line-clamp-2"
        )}
      >
        {post.excerpt}
      </p>

      <div className="mt-auto flex items-center gap-4 border-t border-border pt-3">
        <img
          src={post.authorAvatar}
          alt={post.author}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">
            {post.author}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatBlogDate(post.date)}
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime} min read
            </span>
          </div>
        </div>

        <Link
          to={`/blog/${post.slug}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/5 transition-colors duration-300 hover:bg-primary hover:text-white"
          aria-label={`Read ${post.title}`}
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </article>
);

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const size = DEFAULT_BLOG_PAGE_SIZE;
  const nameFilter = searchParams.get("name") ?? "";
  const categoryBlogIdFilter = searchParams.get("category_blog_id") ?? "";

  const { data: categories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: fetchBlogCategories,
    staleTime: BLOGS_CACHE_TTL,
    gcTime: BLOGS_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const {
    data: blogResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "blogs",
      {
        page,
        size,
        category_blog_id: categoryBlogIdFilter,
      },
    ],
    queryFn: () =>
      fetchBlogs({
        page,
        size,
        category_blog_id: categoryBlogIdFilter || undefined,
      }),
    staleTime: BLOGS_CACHE_TTL,
    gcTime: BLOGS_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const blogs = blogResponse?.data ?? EMPTY_BLOGS;

  const meta = blogResponse?.meta ?? {
    page,
    size,
    total: blogs.length,
    totalPages: 1,
  };

  const activeCategoryName = useMemo(() => {
    if (!categoryBlogIdFilter) {
      return "All";
    }

    const category = categories.find(
      (item) => String(item.id) === categoryBlogIdFilter
    );

    return category?.name ?? "All";
  }, [categories, categoryBlogIdFilter]);

  const filteredBlogs = useMemo(() => {
    if (!nameFilter.trim()) {
      return blogs;
    }

    const keyword = nameFilter.trim().toLowerCase();

    return blogs.filter((post) => post.title.toLowerCase().includes(keyword));
  }, [blogs, nameFilter]);

  const featuredPost =
    page === 1 && !nameFilter && !categoryBlogIdFilter
      ? filteredBlogs[0] ?? null
      : null;

  const gridPosts = featuredPost
    ? filteredBlogs.filter((post) => post.id !== featuredPost.id)
    : filteredBlogs;

  useEffect(() => {
    document.title = "Blog - Kasta Beaute | Tips & Inspirasi Kecantikan";

    const metaTag = document.querySelector('meta[name="description"]');
    const desc =
      "Temukan tips skincare, panduan bahan aktif, tutorial kecantikan, dan inspirasi gaya hidup sehat dari Kasta Beaute.";

    if (metaTag) {
      metaTag.setAttribute("content", desc);
    } else {
      const next = document.createElement("meta");
      next.name = "description";
      next.content = desc;
      document.head.appendChild(next);
    }
  }, []);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next, { replace: true });
  };

  const handlePageChange = (nextPage: number) => {
    updateSearchParams({ page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (meta.totalPages <= 5) {
      for (let i = 1; i <= meta.totalPages; i += 1) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(meta.totalPages - 1, page + 1);

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (page < meta.totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(meta.totalPages);

    return pages;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-luxury pb-16 pt-40 md:pb-20 md:pt-48">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-blush blur-3xl" />

        <div className="container relative space-y-6 text-center">
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            Beauty & Wellness
          </div>

          <h1 className="animate-fade-up font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Our Beauty{" "}
            <em className="gradient-text italic font-medium">Blog</em>
          </h1>

          <p className="mx-auto max-w-xl animate-fade-up text-base leading-relaxed text-muted-foreground md:text-lg">
            Tips skincare, panduan bahan aktif, tutorial kecantikan, dan
            inspirasi gaya hidup sehat dari para ahli kami.
          </p>

          <div className="animate-fade-up flex justify-center gap-8 pt-4">
            {[
              { icon: BookOpen, label: `${meta.total} Articles` },
              { icon: Calendar, label: `Page ${meta.page}` },
              { icon: Sparkles, label: "Expert Verified" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sticky top-[72px] z-40 border-b border-border bg-background/80 py-4 backdrop-blur-md">
        <div className="container space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() =>
                updateSearchParams({
                  category_blog_id: null,
                  page: "1",
                })
              }
              className={cn(
                "shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                !categoryBlogIdFilter
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              All
            </button>

            {categories.map((category: BlogCategory) => (
              <button
                key={category.id}
                onClick={() =>
                  updateSearchParams({
                    category_blog_id: String(category.id),
                    page: "1",
                  })
                }
                className={cn(
                  "shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                  categoryBlogIdFilter === String(category.id)
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto]">
            <input
              type="text"
              value={nameFilter}
              onChange={(event) =>
                updateSearchParams({
                  name: event.target.value || null,
                  page: "1",
                })
              }
              placeholder="Filter by nama artikel"
              className="h-11 rounded-full border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />

            <select
              value={categoryBlogIdFilter}
              onChange={(event) =>
                updateSearchParams({
                  category_blog_id: event.target.value || null,
                  page: "1",
                })
              }
              className="h-11 rounded-full border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Semua kategori</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  setSearchParams(new URLSearchParams(), { replace: true })
                }
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container space-y-12">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: size }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] animate-pulse rounded-3xl bg-muted"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center">
              <p className="font-display text-2xl text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Gagal memuat artikel."}
              </p>
            </div>
          ) : (
            <>
              {featuredPost ? (
                <div className="animate-fade-in">
                  <BlogCard post={featuredPost} featured />
                </div>
              ) : null}

              {gridPosts.length > 0 ? (
                <div className="animate-fade-in grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {gridPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />

                  <p className="font-display text-2xl text-muted-foreground">
                    Belum ada artikel untuk filter ini.
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Filter aktif: kategori {activeCategoryName}, nama{" "}
                    {nameFilter || "semua"}.
                  </p>
                </div>
              )}

              {meta.totalPages > 1 ? (
                <div className="animate-fade-in pt-8">
                  <Pagination>
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();

                            if (page > 1) {
                              handlePageChange(page - 1);
                            }
                          }}
                          className={cn(
                            "rounded-full transition-colors",
                            page === 1 && "pointer-events-none opacity-40"
                          )}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((item, index) =>
                        item === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink
                              href="#"
                              isActive={page === item}
                              onClick={(event) => {
                                event.preventDefault();
                                handlePageChange(item);
                              }}
                              className={cn(
                                "h-10 w-10 rounded-full transition-colors",
                                page === item &&
                                  "border-foreground bg-foreground text-background hover:border-primary hover:bg-primary"
                              )}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();

                            if (page < meta.totalPages) {
                              handlePageChange(page + 1);
                            }
                          }}
                          className={cn(
                            "rounded-full transition-colors",
                            page === meta.totalPages &&
                              "pointer-events-none opacity-40"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Halaman {meta.page} dari {meta.totalPages} • {meta.total}{" "}
                    artikel
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <section className="bg-gradient-luxury py-16 md:py-20">
        <div className="container">
          <div className="glass-card mx-auto max-w-3xl space-y-6 p-10 text-center md:p-14">
            <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Weekly Tips
            </div>

            <h2 className="font-display text-3xl text-balance md:text-4xl">
              Dapatkan Tips Kecantikan{" "}
              <em className="gradient-text italic">Langsung</em> ke Inbox-mu
            </h2>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Subscribe dan dapatkan artikel eksklusif, tips skincare terbaru,
              dan penawaran spesial setiap minggu.
            </p>

            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Email kamu..."
                className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              <Button className="rounded-full bg-foreground px-6 text-sm uppercase tracking-[0.1em] text-background hover:bg-primary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
};

export default BlogPage;