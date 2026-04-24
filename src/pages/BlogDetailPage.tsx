import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  ChevronRight,
  Sparkles,
  Share2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import {
  getPostBySlug,
  getRelatedPosts,
  formatDate,
  type BlogPost,
} from "@/data/blogData";
import { cn } from "@/lib/utils";

/* ───────────────────────────── Related Card ───────────────────────────── */

const RelatedCard = ({ post }: { post: BlogPost }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group bg-card rounded-3xl overflow-hidden soft-shadow hover-lift flex flex-col"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  >
    <div className="aspect-video overflow-hidden bg-gradient-nude">
      <img
        src={post.image}
        alt={post.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    </div>
    <div className="p-5 flex flex-col gap-2 flex-1">
      <span className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium">
        {post.category}
      </span>
      <h3 className="font-display text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
        {post.title}
      </h3>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2">
        <Calendar className="h-3 w-3" />
        {formatDate(post.date)}
        <span>·</span>
        <Clock className="h-3 w-3" />
        {post.readTime} min read
      </div>
    </div>
  </Link>
);

/* ───────────────────────────── BlogDetailPage ───────────────────────────── */

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = slug ? getPostBySlug(slug) : undefined;

  useEffect(() => {
    if (!post) {
      navigate("/blog", { replace: true });
      return;
    }
    document.title = `${post.title} — Kasta Beauté Blog`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", post.excerpt);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = post.excerpt;
      document.head.appendChild(m);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [post, navigate]);

  if (!post) return null;

  const relatedPosts = getRelatedPosts(post);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero Image ── */}
      <section className="relative pt-24 md:pt-28 overflow-hidden bg-gradient-luxury">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />

        <div className="container relative">
          {/* Breadcrumb */}
          <nav
            aria-label="breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 pt-8 animate-fade-in"
          >
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground line-clamp-1 max-w-[200px] sm:max-w-none">
              {post.title}
            </span>
          </nav>

          {/* Article Header */}
          <div className="max-w-3xl mx-auto text-center space-y-5 pb-12 animate-fade-up">
            <span className="inline-block text-[11px] tracking-[0.2em] uppercase text-primary font-medium">
              {post.category}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-balance">
              {post.title}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author + Meta */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30"
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">{post.authorBio.split(" dengan")[0]}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block" />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(post.date)}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  {post.readTime} min read
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {post.tags.length} tags
                </span>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="max-w-4xl mx-auto animate-scale-in">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden luxury-shadow">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Article Body ── */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {/* Back + Share */}
            <div className="flex items-center justify-between mb-10">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Semua Artikel
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-foreground/20 hover:bg-foreground hover:text-background gap-2 text-xs"
                onClick={handleShare}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>

            {/* Article content */}
            <div
              className={cn(
                "prose-blog",
                "text-foreground leading-relaxed"
              )}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author card */}
            <div className="mt-12 p-6 glass-card rounded-3xl flex items-start gap-4">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-semibold text-foreground">
                    {post.author}
                  </p>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Author
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{post.authorBio}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <Tag className="h-4 w-4 text-primary" />
                Tags:
              </div>
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-normal bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <Separator className="my-10" />

            {/* Share section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-luxury rounded-3xl">
              <div>
                <p className="font-display text-lg">Suka artikel ini?</p>
                <p className="text-sm text-muted-foreground">
                  Bagikan ke teman dan bantu mereka merawat kulit dengan lebih baik!
                </p>
              </div>
              <Button
                className="rounded-full bg-foreground text-background hover:bg-primary gap-2 shrink-0"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Bagikan Artikel
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Articles ── */}
      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-gradient-luxury">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-primary mb-2 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  More from {post.category}
                </p>
                <h2 className="font-display text-3xl md:text-4xl">
                  Artikel <em className="italic gradient-text">Terkait</em>
                </h2>
              </div>
              <Link
                to="/blog"
                className="story-link text-sm font-medium tracking-[0.15em] uppercase text-primary"
              >
                Lihat Semua →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {relatedPosts.map((p) => (
                <RelatedCard key={p.id} post={p} />
              ))}
            </div>

            {/* CTA if < 3 related */}
            {relatedPosts.length < 3 && (
              <div className="text-center mt-10">
                <Link to="/blog">
                  <Button
                    variant="outline"
                    className="rounded-full border-foreground/20 hover:bg-foreground hover:text-background px-8 text-sm tracking-[0.15em] uppercase"
                  >
                    Lihat Semua Artikel
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppFloat />
    </main>
  );
};

export default BlogDetailPage;
