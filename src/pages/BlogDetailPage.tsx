import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Share2,
  Sparkles,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import {
  BLOGS_CACHE_TTL,
  fetchBlogById,
  fetchBlogsByCategory,
  formatBlogDate,
  type BlogPost,
} from "@/lib/blogs";
import { cn } from "@/lib/utils";

const RelatedCard = ({ post }: { post: BlogPost }) => (
  <Link
    to={`/blog/${post.id}`}
    className="group flex flex-col overflow-hidden rounded-3xl bg-card soft-shadow hover-lift"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  >
    <div className="aspect-video overflow-hidden bg-gradient-nude">
      <img
        src={post.image}
        alt={post.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    </div>
    <div className="flex flex-1 flex-col gap-2 p-5">
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
        {post.category}
      </span>
      <h3 className="line-clamp-2 font-display text-base leading-tight transition-colors duration-300 group-hover:text-primary">
        {post.title}
      </h3>
      <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {formatBlogDate(post.date)}
        <span>•</span>
        <Clock className="h-3 w-3" />
        {post.readTime} min read
      </div>
    </div>
  </Link>
);

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const blogId = Number(slug ?? 0);

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blog-detail", blogId],
    queryFn: () => fetchBlogById(blogId),
    enabled: Number.isFinite(blogId) && blogId > 0,
    staleTime: BLOGS_CACHE_TTL,
    gcTime: BLOGS_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: relatedResponse } = useQuery({
    queryKey: ["related-blogs", post?.category_blog_id],
    queryFn: () => fetchBlogsByCategory(post!.category_blog_id!, 4),
    enabled: Boolean(post?.category_blog_id),
    staleTime: BLOGS_CACHE_TTL,
    gcTime: BLOGS_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!Number.isFinite(blogId) || blogId <= 0) {
      navigate("/blog", { replace: true });
    }
  }, [blogId, navigate]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!post && !isLoading) {
      navigate("/blog", { replace: true });
    }
  }, [isLoading, navigate, post]);

  useEffect(() => {
    if (!post) {
      return;
    }

    document.title = `${post.title} - Kasta Beaute Blog`;
    const metaTag = document.querySelector('meta[name="description"]');
    if (metaTag) {
      metaTag.setAttribute("content", post.excerpt);
    } else {
      const next = document.createElement("meta");
      next.name = "description";
      next.content = post.excerpt;
      document.head.appendChild(next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [post]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32">
          <div className="container">
            <div className="h-[32rem] animate-pulse rounded-3xl bg-muted" />
          </div>
        </section>
      </main>
    );
  }

  if (isError || !post) {
    return null;
  }

  const relatedPosts = (relatedResponse?.data ?? []).filter((item) => item.id !== post.id).slice(0, 3);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, url: window.location.href });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-luxury pt-24 md:pt-28">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />

        <div className="container relative">
          <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-1.5 pt-8 text-xs text-muted-foreground animate-fade-in">
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/blog" className="transition-colors hover:text-primary">
              Blog
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="line-clamp-1 max-w-[200px] text-foreground sm:max-w-none">{post.title}</span>
          </nav>

          <div className="mx-auto max-w-3xl space-y-5 pb-12 text-center animate-fade-up">
            <span className="inline-block text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              {post.category}
            </span>
            <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30"
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">{post.authorBio}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="hidden h-8 sm:block" />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatBlogDate(post.date)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  {post.readTime} min read
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {Math.max(post.tags.length, 1)} tags
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-4xl animate-scale-in">
            <div className="relative aspect-video overflow-hidden rounded-[2rem] luxury-shadow">
              <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 flex items-center justify-between">
              <Link
                to="/blog"
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Semua Artikel
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full border-foreground/20 text-xs hover:bg-foreground hover:text-background"
                onClick={handleShare}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>

            <div className={cn("prose-blog text-foreground leading-relaxed")} dangerouslySetInnerHTML={{ __html: post.content }} />

            <div className="glass-card mt-12 flex items-start gap-4 rounded-3xl p-6">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-display font-semibold text-foreground">{post.author}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-primary">
                    Author
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{post.authorBio}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <div className="mr-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4 text-primary" />
                Tags:
              </div>
              {(post.tags.length > 0 ? post.tags : [post.category]).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer rounded-full bg-accent px-3 py-1 text-xs font-normal text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <Separator className="my-10" />

            <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-gradient-luxury p-6 sm:flex-row">
              <div>
                <p className="font-display text-lg">Suka artikel ini?</p>
                <p className="text-sm text-muted-foreground">
                  Bagikan ke teman dan bantu mereka merawat kulit dengan lebih baik!
                </p>
              </div>
              <Button
                className="shrink-0 gap-2 rounded-full bg-foreground text-background hover:bg-primary"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Bagikan Artikel
              </Button>
            </div>
          </div>
        </div>
      </section>

      {relatedPosts.length > 0 ? (
        <section className="bg-gradient-luxury py-16 md:py-20">
          <div className="container">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  More from {post.category}
                </p>
                <h2 className="font-display text-3xl md:text-4xl">
                  Artikel <em className="gradient-text italic">Terkait</em>
                </h2>
              </div>
              <Link
                to={post.category_blog_id ? `/blog?category_blog_id=${post.category_blog_id}` : "/blog"}
                className="story-link text-sm font-medium uppercase tracking-[0.15em] text-primary"
              >
                Lihat Semua →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
              {relatedPosts.map((item) => (
                <RelatedCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
      <WhatsAppFloat />
    </main>
  );
};

export default BlogDetailPage;
