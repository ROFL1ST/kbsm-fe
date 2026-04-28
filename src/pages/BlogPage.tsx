import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  blogPosts,
  BLOG_CATEGORIES,
  POSTS_PER_PAGE,
  formatDate,
  type BlogPost,
  type BlogCategory,
} from "@/data/blogData";
import { cn } from "@/lib/utils";

/* ───────────────────────────── BlogCard ───────────────────────────── */

const BlogCard = ({ post, featured = false }: { post: BlogPost; featured?: boolean }) => (
  <article
    className={cn(
      "group bg-card rounded-3xl overflow-hidden soft-shadow hover-lift flex flex-col",
      featured && "md:col-span-2 md:flex-row"
    )}
  >
    {/* Image */}
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-nude shrink-0",
        featured ? "md:w-1/2 aspect-video md:aspect-auto" : "aspect-video"
      )}
    >
      {post.featured && (
        <span className="absolute top-4 left-4 z-10 bg-foreground text-background text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full">
          Featured
        </span>
      )}
      <img
        src={post.image}
        alt={post.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>

    {/* Content */}
    <div className={cn("p-6 flex flex-col gap-3 flex-1", featured && "md:p-8 md:justify-center")}>
      {/* Category */}
      <span className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium">
        {post.category}
      </span>

      {/* Title */}
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

      {/* Excerpt */}
      <p className={cn("text-sm text-muted-foreground leading-relaxed", featured ? "line-clamp-3" : "line-clamp-2")}>
        {post.excerpt}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 mt-auto pt-3 border-t border-border">
        <img
          src={post.authorAvatar}
          alt={post.author}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{post.author}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(post.date)}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime} min read
            </span>
          </div>
        </div>
        <Link
          to={`/blog/${post.slug}`}
          className="shrink-0 h-9 w-9 rounded-full bg-foreground/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors duration-300"
          aria-label={`Read ${post.title}`}
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </article>
);

/* ───────────────────────────── BlogPage ───────────────────────────── */

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "All">("All");

  useEffect(() => {
    document.title = "Blog — Kasta Beauté | Tips & Inspirasi Kecantikan";
    const meta = document.querySelector('meta[name="description"]');
    const desc =
      "Temukan tips skincare, panduan bahan aktif, tutorial kecantikan, dan inspirasi gaya hidup sehat dari para ahli kecantikan Kasta Beauté.";
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const filteredPosts = useMemo(
    () =>
      activeCategory === "All"
        ? blogPosts
        : blogPosts.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const featuredPost = currentPage === 1 && activeCategory === "All" ? blogPosts[0] : null;
  const gridPosts = featuredPost
    ? paginatedPosts.filter((p) => p.id !== featuredPost.id)
    : paginatedPosts;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative pt-40 md:pt-48 pb-16 md:pb-20 overflow-hidden bg-gradient-luxury">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] bg-blush rounded-full blur-3xl" />

        <div className="container relative text-center space-y-6">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            Beauty & Wellness
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight animate-fade-up">
            Our Beauty{" "}
            <em className="italic font-medium gradient-text">Blog</em>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-up">
            Tips skincare, panduan bahan aktif, tutorial kecantikan, dan inspirasi
            gaya hidup sehat dari para ahli kami.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-4 animate-fade-up">
            {[
              { icon: BookOpen, label: `${blogPosts.length} Articles` },
              { icon: Calendar, label: "Updated Weekly" },
              { icon: Sparkles, label: "Expert Verified" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="sticky top-[72px] z-40 bg-background/80 backdrop-blur-md border-b border-border py-4">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(["All", ...BLOG_CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as BlogCategory | "All")}
                className={cn(
                  "shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === cat
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog Grid ── */}
      <section className="py-16 md:py-20">
        <div className="container space-y-12">
          {/* Featured Post (only on page 1, no filter) */}
          {featuredPost && (
            <div className="animate-fade-in">
              <BlogCard post={featuredPost} featured />
            </div>
          )}

          {/* Grid */}
          {gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {gridPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-muted-foreground">
                Belum ada artikel di kategori ini.
              </p>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="pt-8 animate-fade-in">
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={cn(
                        "rounded-full transition-colors",
                        currentPage === 1 && "pointer-events-none opacity-40"
                      )}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, idx) =>
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          className={cn(
                            "rounded-full w-10 h-10 transition-colors",
                            currentPage === page &&
                              "bg-foreground text-background border-foreground hover:bg-primary hover:border-primary"
                          )}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={cn(
                        "rounded-full transition-colors",
                        currentPage === totalPages && "pointer-events-none opacity-40"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <p className="text-center text-xs text-muted-foreground mt-3">
                Halaman {currentPage} dari {totalPages} •{" "}
                {filteredPosts.length} artikel
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Newsletter Banner ── */}
      <section className="py-16 md:py-20 bg-gradient-luxury">
        <div className="container">
          <div className="glass-card p-10 md:p-14 text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Weekly Tips
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-balance">
              Dapatkan Tips Kecantikan{" "}
              <em className="italic gradient-text">Langsung</em> ke Inbox-mu
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Subscribe dan dapatkan artikel eksklusif, tips skincare terbaru, dan
              penawaran spesial setiap minggu.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email kamu..."
                className="flex-1 px-5 py-3 rounded-full bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <Button className="rounded-full bg-foreground text-background hover:bg-primary px-6 text-sm tracking-[0.1em] uppercase whitespace-nowrap">
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
