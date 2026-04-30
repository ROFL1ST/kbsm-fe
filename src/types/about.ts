/* ---------------------------------------------------------------
 * About Page — Content Types
 * Struktur ini mencerminkan shape JSON statis di src/data/about.json
 * dan siap di-replace dengan response dari API (GET /api/about-content)
 * --------------------------------------------------------------- */

export interface AboutCtaButton {
  label: string;
  href: string;
}

/* ---------- Hero ---------- */
export interface AboutHero {
  badge: string;
  /** HTML string — bisa mengandung <em>, <br />, dll */
  title_html: string;
  /** HTML string */
  subtitle_html: string;
  cta_primary: AboutCtaButton;
  cta_secondary: AboutCtaButton;
}

/* ---------- Brand Story ---------- */
export interface AboutBrandStory {
  badge: string;
  /** HTML string */
  title_html: string;
  /** HTML string — bisa berisi beberapa <p> */
  content_html: string;
  tags: string[];
  established_year: string;
  location: string;
}

/* ---------- Stats ---------- */
export interface AboutStatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface AboutStats {
  badge: string;
  /** HTML string */
  title_html: string;
  items: AboutStatItem[];
}

/* ---------- Values ---------- */
export interface AboutValueItem {
  /**
   * Nama icon dari lucide-react (PascalCase),
   * contoh: "Leaf", "ShieldCheck", "Heart"
   */
  icon: string;
  title: string;
  /** HTML string */
  description_html: string;
}

export interface AboutValues {
  badge: string;
  /** HTML string */
  title_html: string;
  /** HTML string */
  subtitle_html: string;
  items: AboutValueItem[];
}

/* ---------- CTA ---------- */
export interface AboutCta {
  /** HTML string */
  title_html: string;
  /** HTML string */
  subtitle_html: string;
  cta_primary: AboutCtaButton;
  cta_secondary: AboutCtaButton;
}

/* ---------- Root ---------- */
export interface AboutPageContent {
  hero: AboutHero;
  brand_story: AboutBrandStory;
  stats: AboutStats;
  values: AboutValues;
  cta: AboutCta;
}
