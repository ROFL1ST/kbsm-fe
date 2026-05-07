import { Facebook } from "lucide-react";
// import { Instagram, Twitter, Youtube } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/products";

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://web.facebook.com/valen.sky.566?mibextid=wwXIfr&rdid=6tUMUvvVkhuD9yD2",
    icon: <Facebook className="h-4 w-4" />,
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@reresky8", // ganti dengan URL TikTok
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
  {
    label: "Shopee",
    href: "https://id.shp.ee/YPHLxocb",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M12 2C9.243 2 7 4.243 7 7H5a2 2 0 0 0-2 2l-1 11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2L21 9a2 2 0 0 0-2-2h-2c0-2.757-2.243-5-5-5zm0 2a3 3 0 0 1 3 3H9a3 3 0 0 1 3-3zm0 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
      </svg>
    ),
  },
  // { label: "Instagram", href: "#", icon: <Instagram className="h-4 w-4" /> },
  // { label: "X / Twitter", href: "#", icon: <Twitter className="h-4 w-4" /> },
  // { label: "Youtube",  href: "#", icon: <Youtube className="h-4 w-4" /> },
];

const staticCols = [
  {
    title: "About",
    titleHref: "/about",
    links: [
      { label: "Our Story", href: "/about#our-story" },
      // { label: "Ingredients", href: "#" },
      // { label: "Sustainability", href: "#" },
      // { label: "Press", href: "#" },
      // { label: "Careers", href: "#" },
      { label: "Kenapa Memilih Kami?", href: "/about#kenapa-memilih-kami" },
      { label: "Customer Stories", href: "/about#customer-stories" },
      { label: "Blog", href: "/blog" },
    ],
  },
  // {
  //   title: "Customer Care",
  //   links: [
  //     { label: "Contact Us", href: "#" },
  //     { label: "FAQs", href: "#" },
  //     { label: "Shipping Info", href: "#" },
  //     { label: "Returns", href: "#" },
  //     { label: "Track Order", href: "#" },
  //   ],
  // },
  // {
  //   title: "Policies",
  //   links: [
  //     { label: "Privacy Policy", href: "#" },
  //     { label: "Terms of Service", href: "#" },
  //     { label: "Cookie Policy", href: "#" },
  //   ],
  // },
];

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const hashIdx = href.indexOf("#");
    if (hashIdx === -1) return;
    e.preventDefault();
    const path = href.slice(0, hashIdx) || "/";
    const hash = href.slice(hashIdx + 1);
    if (location.pathname === path) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  };

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  return (
    <footer id="contact" className="bg-foreground text-background pt-20 pb-8">
      <div className="container">
        {/* Top */}
        <div className="grid lg:grid-cols-12 gap-10 pb-16 border-b border-background/10">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-5">
            <a
              href="#home"
              className="font-display text-3xl font-semibold inline-block"
            >
              Kasta<span className="text-primary-glow italic">Beaute</span>
            </a>
            <p className="text-background/60 text-sm leading-relaxed max-w-sm">
              Premium skincare yang menggabungkan ilmu pengetahuan modern dengan
              kekuatan alam — diciptakan untuk kulit sehat, glowing, dan
              terawat.
            </p>

            <div>
              <p className="text-background/40 tracking-[0.2em] uppercase text-xs mb-3">
                Sosmed Kasta Beaute
              </p>
              <div className="flex gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Link cols */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Shop — dynamic categories */}
            <div>
              <h4 className="font-display text-base mb-4 text-primary-glow">
                <Link to="/shop" className="hover:text-background transition-colors">
                  Shop
                </Link>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/shop#bestseller"
                    className="text-sm text-background/60 hover:text-background transition-colors"
                    onClick={(e) => handleHashClick(e, "/shop#bestseller")}
                  >
                    Best Seller
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#collections"
                    className="text-sm text-background/60 hover:text-background transition-colors"
                    onClick={(e) => handleHashClick(e, "/#collections")}
                  >
                    Collection
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/shop?category_id=${cat.id}`}
                      className="text-sm text-background/60 hover:text-background transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {staticCols.map((c) => (
              <div key={c.title}>
                <h4 className="font-display text-base mb-4 text-primary-glow">
                  <Link to={c.titleHref} className="hover:text-background transition-colors">
                    {c.title}
                  </Link>
                </h4>
                <ul className="space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.href}
                        className="text-sm text-background/60 hover:text-background transition-colors"
                        onClick={l.href.includes("#") ? (e) => handleHashClick(e, l.href) : undefined}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Middle */}
        <div className="grid md:grid-cols-2 gap-6 py-8 border-b border-background/10 text-xs">
          <div>
            <p className="text-background/40 tracking-[0.2em] uppercase mb-3">
              We Accept
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                // "VISA",
                // "Mastercard",
                // "Midtrans",
                // "GoPay",
                // "ShopeePay",
                // "OVO",
                "Mandiri",
              ].map((p) => (
                <span
                  key={p}
                  className="px-3 py-1.5 bg-background/5 border border-background/10 rounded-md text-background/70"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-background/40 tracking-[0.2em] uppercase mb-3">
              Shipping Partners
            </p>
            <div className="flex flex-wrap md:justify-end gap-2">
              {["JNE", "J&T"].map((p) => (
                <span
                  key={p}
                  className="px-3 py-1.5 bg-background/5 border border-background/10 rounded-md text-background/70"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-8 text-xs text-background/40">
          <p>© 2026 KastaBeaute. All Rights Reserved.</p>
          <p>Crafted with care in Indonesia ✦ BPOM Certified ✦ Cruelty Free</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
