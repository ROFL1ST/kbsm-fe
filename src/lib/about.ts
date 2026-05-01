import type { AboutPageContent } from "@/types/about";

const API_BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

type ApiEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
  error: string | null;
};

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("KBBU_API belum dikonfigurasi.");
  }
  return API_BASE_URL;
}

/**
 * Normalizes the raw API response to ensure all required fields exist.
 * Guards against missing/null sections so the page never breaks.
 */
function normalizeAboutContent(raw: Record<string, unknown>): AboutPageContent {
  const hero = (raw.hero ?? {}) as Record<string, unknown>;
  const brand_story = (raw.brand_story ?? {}) as Record<string, unknown>;
  const stats = (raw.stats ?? {}) as Record<string, unknown>;
  const values = (raw.values ?? {}) as Record<string, unknown>;
  const cta = (raw.cta ?? {}) as Record<string, unknown>;

  const parseCtaButton = (btn: unknown, fallbackLabel: string, fallbackHref: string) => {
    const b = (btn ?? {}) as Record<string, unknown>;
    return {
      label: typeof b.label === "string" && b.label.trim() ? b.label : fallbackLabel,
      href: typeof b.href === "string" && b.href.trim() ? b.href : fallbackHref,
    };
  };

  const str = (val: unknown, fallback = "") =>
    typeof val === "string" ? val : fallback;

  return {
    hero: {
      badge: str(hero.badge, "Tentang Kami"),
      title_html: str(hero.title_html),
      subtitle_html: str(hero.subtitle_html),
      cta_primary: parseCtaButton(hero.cta_primary, "Belanja Sekarang", "/shop"),
      cta_secondary: parseCtaButton(hero.cta_secondary, "Baca Blog Kami", "/blog"),
    },
    brand_story: {
      badge: str(brand_story.badge, "Cerita Kami"),
      title_html: str(brand_story.title_html),
      content_html: str(brand_story.content_html),
      tags: Array.isArray(brand_story.tags)
        ? brand_story.tags.filter((t): t is string => typeof t === "string")
        : [],
      established_year: str(brand_story.established_year, "2020"),
      location: str(brand_story.location, "Indonesia"),
    },
    stats: {
      badge: str(stats.badge, "Dalam Angka"),
      title_html: str(stats.title_html),
      items: Array.isArray(stats.items)
        ? stats.items
            .filter((i): i is Record<string, unknown> => !!i && typeof i === "object")
            .map((i) => ({
              value: Number(i.value ?? 0),
              suffix: str(i.suffix),
              label: str(i.label),
            }))
        : [],
    },
    values: {
      badge: str(values.badge, "Nilai Kami"),
      title_html: str(values.title_html),
      subtitle_html: str(values.subtitle_html),
      items: Array.isArray(values.items)
        ? values.items
            .filter((i): i is Record<string, unknown> => !!i && typeof i === "object")
            .map((i) => ({
              icon: str(i.icon, "Sparkles"),
              title: str(i.title),
              description_html: str(i.description_html),
            }))
        : [],
    },
    cta: {
      title_html: str(cta.title_html),
      subtitle_html: str(cta.subtitle_html),
      cta_primary: parseCtaButton(cta.cta_primary, "Belanja Sekarang", "/shop"),
      cta_secondary: parseCtaButton(cta.cta_secondary, "Baca Tips Kecantikan", "/blog"),
    },
  };
}

export async function fetchAboutContent(): Promise<AboutPageContent> {
  const response = await fetch(`${getApiBaseUrl()}/about`);
  const payload = (await response.json()) as ApiEnvelope<unknown>;

  if (!response.ok || !payload.status) {
    throw new Error(
      payload.error || payload.message || "Gagal mengambil konten halaman About."
    );
  }

  const raw =
    payload.data && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : {};

  return normalizeAboutContent(raw);
}
