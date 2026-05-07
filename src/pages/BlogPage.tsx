import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, Calendar, Clock, Search, Sparkles, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const PAGE_SIZE_OPTIONS = [3, 6, 9, 12];

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

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
      featured && "md:col-span-2 md:flex-row",
    )}
  >
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-gradient-nude",
        featured ? "aspect-video md:w-1/2 md:aspect-auto" : "aspect-video",
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
        featured && "md:justify-center md:p-8",
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
        {post.category}
      </span>

      <Link
        to={`/blog/${post.id}`}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-4"
      >
        <h3
          className={cn(
            "font-display leading-tight transition-colors duration-300 group-hover:text-primary hover:text-primary",
            featured ? "text-2xl md:text-3xl" : "line-clamp-2 text-lg",
          )}
        >
          {post.title}
        </h3>
      </Link>

      <p
        className={cn(
          "text-sm leading-relaxed text-muted-foreground",
          featured ? "line-clamp-3" : "line-clamp-2",
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
          <p className="truncate text-xs font-medium text-foreground">{post.author}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatBlogDate(post.date)}
            </span>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime} min read
            </span>
          </div>
        </div>
        <Link
          to={`/blog/${post.id}`}
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
  const page = parsePositiveInteger(searchParams.get("page"), 1);
  const size = parsePositiveInteger(searchParams.get("size"), DEFAULT_BLOG_PAGE_SIZE);
  const blogSearch = searchParams.get("search") ?? "";
  const categoryBlogId = searchParams.get("category_blog_id") ?? "";
  const [blogSearchInput, setBlogSearchInput] = useState(blogSearch);

  useEffect(() => {
    setBlogSearchInput(blogSearch);
  }, [blogSearch]);

  useEffect(() => {
    document.title = "Blog - Kasta Beaute | Tips & Inspirasi Kecantikan";
    const meta = document.querySelector('meta[name="description"]');
    const description =
      "Temukan tips skincare, panduan bahan aktif, tutorial kecantikan, dan inspirasi gaya hidup sehat dari para ahli kecantikan Kasta Beaute.";

    if (meta) {
      meta.setAttribute("content", description);
    } else {
      const nextMeta = document.createElement("meta");
      nextMeta.name = "description";
      nextMeta.content = description;
      document.head.appendChild(nextMeta);
    }
  }, []);

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
    queryKey: ["blogs", { page, size, category_blog_id: categoryBlogId }],
    queryFn: () =>
      fetchBlogs({
        page,
        size,
        category_blog_id: categoryBlogId || undefined,
      }),
    staleTime: BLOGS_CACHE_TTL,
    gcTime: BLOGS_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const posts = blogResponse?.data ?? [];
  const filteredPosts = useMemo(() => {
    const normalizedSearch = blogSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return posts;
    }

    return posts.filter((post) =>
      post.title.toLowerCase().includes(normalizedSearch),
    );
  }, [blogSearch, posts]);
  const meta = blogResponse?.meta;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const totalItems = meta?.total ?? posts.length;
  const displayedItems = blogSearch ? filteredPosts.length : totalItems;
  const activeCategory = useMemo(
    () => categories.find((item) => String(item.id) === categoryBlogId) ?? null,
    [categories, categoryBlogId],
  );
  const featuredPost = page === 1 && !blogSearch && !categoryBlogId ? filteredPosts[0] ?? null : null;
  const gridPosts = featuredPost ? filteredPosts.filter((item) => item.id !== featuredPost.id) : filteredPosts;

  const updateSearchParams = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    setSearchParams(next, { replace: true });
  };

  const handlePageChange = (nextPage: number) => {
    updateSearchParams((params) => {
      params.set("page", String(nextPage));
      params.set("size", String(size));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (categoryId: string) => {
    updateSearchParams((params) => {
      params.delete("page");
      params.set("size", String(size));

      if (categoryId) {
        params.set("category_blog_id", categoryId);
      } else {
        params.delete("category_blog_id");
      }
    });
  };

  const handleSizeChange = (value: string) => {
    updateSearchParams((params) => {
      params.set("size", value);
      params.set("page", "1");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBlogSearchSubmit = () => {
    updateSearchParams((params) => {
      params.delete("page");
      params.set("size", String(size));

      const trimmed = blogSearchInput.trim();
      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }
    });
  };

  const clearBlogSearch = () => {
    setBlogSearchInput("");
    updateSearchParams((params) => {
      params.delete("search");
      params.delete("page");
      params.set("size", String(size));
    });
  };

  const clearAllFilters = () => {
    setBlogSearchInput("");
    setSearchParams(new URLSearchParams({ size: String(DEFAULT_BLOG_PAGE_SIZE) }), {
      replace: true,
    });
  };

  const getPageNumbers = () => {
    const items: (number | "ellipsis")[] = [];

    if (totalPages <= 5) {
      for (let index = 1; index <= totalPages; index += 1) {
        items.push(index);
      }
      return items;
    }

    items.push(1);

    if (page > 3) {
      items.push("ellipsis");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let index = start; index <= end; index += 1) {
      items.push(index);
    }

    if (page < totalPages - 2) {
      items.push("ellipsis");
    }

    items.push(totalPages);
    return items;
  };

  const renderLoadingState = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-3xl bg-card soft-shadow">
          <div className="aspect-video animate-pulse bg-muted" />
          <div className="space-y-3 p-6">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-7 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-luxury pb-16 pt-40 md:pb-20 md:pt-48">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-blush blur-3xl" />

        <div className="container relative space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary glass animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            Beauty & Wellness
          </div>

          <h1 className="font-display text-5xl leading-[1.05] tracking-tight animate-fade-up sm:text-6xl lg:text-7xl">
            Our Beauty <em className="gradient-text italic font-medium">Blog</em>
          </h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground animate-fade-up md:text-lg">
            Tips skincare, panduan bahan aktif, tutorial kecantikan, dan inspirasi gaya hidup sehat dari para ahli kami.
          </p>

          <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground animate-fade-up">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {isLoading ? "Memuat artikel..." : `${totalItems} Articles`}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {categories.length > 0 ? `${categories.length} Categories` : "Updated Weekly"}
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Expert Verified
            </span>
          </div>
        </div>
      </section>

      <section className="sticky top-[72px] z-40 border-b border-border bg-background/80 py-4 backdrop-blur-md">
        <div className="container space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => handleCategoryChange("")}
              className={cn(
                "shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                !categoryBlogId
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              All
            </button>
            {categories.map((category: BlogCategory) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(String(category.id))}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
                  categoryBlogId === String(category.id)
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid gap-3 rounded-2xl border bg-card p-3 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-center">
            <Select value={String(size)} onValueChange={handleSizeChange}>
              <SelectTrigger className="h-11 w-full rounded-full bg-background">
                <SelectValue placeholder="Articles per page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Cari nama blog"
              value={blogSearchInput}
              onChange={(event) => setBlogSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleBlogSearchSubmit();
                }
              }}
              className="h-11 min-w-0 rounded-full bg-background"
            />

            <Button
              type="button"
              onClick={handleBlogSearchSubmit}
              className="h-11 rounded-full px-6"
            >
              <Search className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>

          {(blogSearch || categoryBlogId) ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-accent/60 px-5 py-3 text-sm backdrop-blur-sm">
              {blogSearch ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1">
                  Nama blog: <strong>{blogSearch}</strong>
                  <button onClick={clearBlogSearch} aria-label="Clear blog name filter">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ) : null}
              {activeCategory ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1">
                  Category: <strong>{activeCategory.name}</strong>
                  <button
                    onClick={() => handleCategoryChange("")}
                    aria-label="Clear category filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container space-y-12">
          {isLoading ? renderLoadingState() : null}

          {isError ? (
            <div className="rounded-3xl bg-card p-8 text-center text-muted-foreground soft-shadow">
              {(error as Error | null)?.message ?? "Gagal memuat daftar blog. Coba lagi beberapa saat lagi."}
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <>
              {featuredPost ? (
                <div className="animate-fade-in">
                  <BlogCard post={featuredPost} featured />
                </div>
              ) : null}

              {gridPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 animate-fade-in sm:grid-cols-2 lg:grid-cols-3">
                  {gridPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="font-display text-2xl text-muted-foreground">
                    Belum ada artikel yang cocok dengan filter ini.
                  </p>
                </div>
              )}

              {totalPages > 1 ? (
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
                            page === 1 && "pointer-events-none opacity-40",
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
                                "border-foreground bg-foreground text-background hover:border-primary hover:bg-primary",
                              )}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            if (page < totalPages) {
                              handlePageChange(page + 1);
                            }
                          }}
                          className={cn(
                            "rounded-full transition-colors",
                            page === totalPages && "pointer-events-none opacity-40",
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Halaman {page} dari {totalPages} &middot; {displayedItems} artikel
                  </p>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
};

export default BlogPage;
