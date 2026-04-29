import blogAntiAging from "@/assets/blog-anti-aging.jpg";
import blogGlowTutorial from "@/assets/blog-glow-tutorial.jpg";
import blogIngredients from "@/assets/blog-ingredients.jpg";
import blogSensitiveSkin from "@/assets/blog-sensitive-skin.jpg";
import blogSkincareRoutine from "@/assets/blog-skincare-routine.jpg";
import blogSpfGuide from "@/assets/blog-spf-guide.jpg";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

const API_BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

export const BLOGS_CACHE_TTL = 1000 * 60 * 5;
export const DEFAULT_BLOG_PAGE_SIZE = 6;

const FALLBACK_BLOG_IMAGES = [
  blogSkincareRoutine,
  blogIngredients,
  blogGlowTutorial,
  blogSpfGuide,
  blogAntiAging,
  blogSensitiveSkin,
];

const FALLBACK_AUTHOR_AVATARS = [testimonial1, testimonial2, testimonial3];

type ApiEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
  error: string | null;
  meta?: unknown;
};

export type BlogCategory = {
  id: number;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category_blog_id: number | null;
  category: string;
  author: string;
  authorAvatar: string;
  authorBio: string;
  date: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
};

export type BlogListParams = {
  page?: number;
  size?: number;
  id?: number | string;
  category_blog_id?: number | string;
};

export type BlogListMeta = {
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

export type BlogListResponse = {
  data: BlogPost[];
  meta: BlogListMeta;
};

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("KBBU_API belum dikonfigurasi.");
  }

  return API_BASE_URL;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function ensureHtmlContent(value: string) {
  if (!value.trim()) {
    return "<p>Konten artikel belum tersedia.</p>";
  }

  return /<[^>]+>/.test(value) ? value : `<p>${value}</p>`;
}

function resolveImage(raw: Record<string, unknown>, id: number) {
  const candidate = [
    raw.path,
    raw.image,
    raw.thumbnail,
    raw.cover,
    raw.banner,
  ].find((value) => typeof value === "string" && value.trim().length > 0);

  return typeof candidate === "string"
    ? candidate
    : FALLBACK_BLOG_IMAGES[id % FALLBACK_BLOG_IMAGES.length];
}

function resolveDate(raw: Record<string, unknown>) {
  const candidate = [
    raw.created_at,
    raw.updated_at,
    raw.published_at,
    raw.date,
  ].find((value) => typeof value === "string" && value.trim().length > 0);

  return typeof candidate === "string" ? candidate : new Date().toISOString();
}

function resolveTags(raw: Record<string, unknown>) {
  if (Array.isArray(raw.tags)) {
    return raw.tags
      .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      .map((tag) => tag.trim());
  }

  if (typeof raw.tags === "string" && raw.tags.trim().length > 0) {
    return raw.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

function normalizeBlogPost(item: unknown, index = 0): BlogPost | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const raw = item as Record<string, unknown>;
  const id = Number(raw.id ?? raw.blog_id ?? raw.post_id ?? 0);
  const title = typeof raw.title === "string"
    ? raw.title
    : typeof raw.name === "string"
      ? raw.name
      : "";

  if (!Number.isFinite(id) || id <= 0 || !title.trim()) {
    return null;
  }

  const rawContent = typeof raw.content === "string"
    ? raw.content
    : typeof raw.description === "string"
      ? raw.description
      : typeof raw.body === "string"
        ? raw.body
        : "";
  const excerptSource = typeof raw.excerpt === "string"
    ? raw.excerpt
    : typeof raw.summary === "string"
      ? raw.summary
      : stripHtml(rawContent);
  const content = ensureHtmlContent(rawContent || excerptSource);
  const excerpt = excerptSource.trim() || "Baca artikel lengkap dari Kasta Beaute.";
  const categoryName = typeof raw.category_blog_name === "string"
    ? raw.category_blog_name
    : typeof raw.category_name === "string"
      ? raw.category_name
      : typeof raw.category === "string"
        ? raw.category
        : "Blog";
  const categoryBlogId = Number(raw.category_blog_id ?? raw.category_id ?? 0);
  const author = typeof raw.author === "string" && raw.author.trim().length > 0
    ? raw.author
    : "Kasta Beaute";
  const authorBio = typeof raw.author_bio === "string" && raw.author_bio.trim().length > 0
    ? raw.author_bio
    : "Tim editorial Kasta Beaute.";
  const date = resolveDate(raw);
  const textForReadTime = stripHtml(content);
  const words = textForReadTime.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(words / 180));

  return {
    id,
    title: title.trim(),
    excerpt,
    content,
    image: resolveImage(raw, index),
    category_blog_id: Number.isFinite(categoryBlogId) && categoryBlogId > 0 ? categoryBlogId : null,
    category: categoryName,
    author,
    authorAvatar: FALLBACK_AUTHOR_AVATARS[index % FALLBACK_AUTHOR_AVATARS.length],
    authorBio,
    date,
    readTime,
    tags: resolveTags(raw),
    featured: Boolean(raw.featured ?? raw.is_featured ?? index === 0),
  };
}

function normalizeBlogCategories(input: unknown): BlogCategory[] {
  const items = Array.isArray(input)
    ? input
    : Array.isArray((input as { data?: unknown[] })?.data)
      ? (input as { data: unknown[] }).data
      : [];

  return items.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const raw = item as Record<string, unknown>;
    const id = Number(raw.id ?? raw.category_blog_id ?? 0);
    const name = typeof raw.name === "string" ? raw.name : "";

    if (!Number.isFinite(id) || id <= 0 || !name.trim()) {
      return [];
    }

    return [{
      id,
      name: name.trim(),
      created_at: typeof raw.created_at === "string" ? raw.created_at : null,
      updated_at: typeof raw.updated_at === "string" ? raw.updated_at : null,
    }];
  });
}

function resolveBlogArray(input: unknown) {
  if (Array.isArray(input)) {
    return input;
  }

  if (input && typeof input === "object") {
    const raw = input as Record<string, unknown>;

    if (Array.isArray(raw.data)) {
      return raw.data;
    }

    if (Array.isArray(raw.items)) {
      return raw.items;
    }

    if (Array.isArray(raw.rows)) {
      return raw.rows;
    }
  }

  return [];
}

function normalizeMeta(meta: unknown, fallbackPage: number, fallbackSize: number, totalItems: number): BlogListMeta {
  const raw = meta && typeof meta === "object" ? meta as Record<string, unknown> : {};
  const page = Number(raw.page ?? raw.current_page ?? fallbackPage);
  const size = Number(raw.size ?? raw.limit ?? raw.per_page ?? fallbackSize);
  const total = Number(raw.total ?? raw.total_data ?? raw.count ?? totalItems);
  const totalPages = Number(raw.total_pages ?? raw.last_page ?? (size > 0 ? Math.ceil(total / size) : 1));

  return {
    page: Number.isFinite(page) && page > 0 ? page : fallbackPage,
    size: Number.isFinite(size) && size > 0 ? size : fallbackSize,
    total: Number.isFinite(total) && total >= 0 ? total : totalItems,
    totalPages: Number.isFinite(totalPages) && totalPages > 0
      ? totalPages
      : Math.max(1, Math.ceil((Number.isFinite(total) ? total : totalItems) / (Number.isFinite(size) && size > 0 ? size : fallbackSize))),
  };
}

export async function fetchBlogCategories() {
  const response = await fetch(`${getApiBaseUrl()}/category-blogs`);
  const payload = await response.json() as ApiEnvelope<unknown>;

  if (!response.ok || !payload.status) {
    throw new Error(payload.error || payload.message || "Gagal mengambil kategori blog.");
  }

  return normalizeBlogCategories(payload.data);
}

export async function fetchBlogs(params: BlogListParams = {}): Promise<BlogListResponse> {
  const query = new URLSearchParams();
  const page = typeof params.page === "number" && Number.isFinite(params.page) ? params.page : 1;
  const size = typeof params.size === "number" && Number.isFinite(params.size) ? params.size : DEFAULT_BLOG_PAGE_SIZE;

  query.set("page", String(page));
  query.set("size", String(size));

  if (params.id !== undefined && params.id !== "") {
    query.set("id", String(params.id));
  }

  if (params.category_blog_id !== undefined && params.category_blog_id !== "") {
    query.set("category_blog_id", String(params.category_blog_id));
  }

  const response = await fetch(`${getApiBaseUrl()}/blogs?${query.toString()}`);
  const payload = await response.json() as ApiEnvelope<unknown>;

  if (!response.ok || !payload.status) {
    throw new Error(payload.error || payload.message || "Gagal mengambil daftar blog.");
  }

  const rawItems = resolveBlogArray(payload.data);
  const items = rawItems
    .map((item, index) => normalizeBlogPost(item, index))
    .filter((item): item is BlogPost => item !== null);

  return {
    data: items,
    meta: normalizeMeta((payload as { meta?: unknown }).meta, page, size, items.length),
  };
}

export async function fetchBlogById(id: number) {
  const response = await fetchBlogs({ id, size: 1, page: 1 });
  return response.data[0] ?? null;
}

export async function fetchBlogsByCategory(categoryBlogId: number, size = 3) {
  return fetchBlogs({
    category_blog_id: categoryBlogId,
    size,
    page: 1,
  });
}

export const formatBlogDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
