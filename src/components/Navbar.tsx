import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import {
  AUTH_STATE_CHANGE_EVENT,
  clearAccessToken,
  hasAccessToken,
} from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import NavbarSearchDropdown from "@/components/NavbarSearchDropdown";

const shopCategories = [
  {
    title: "Cleansers",
    items: ["Foaming Cleanser", "Oil Cleanser", "Micellar Water"],
  },
  { title: "Serums", items: ["Vitamin C", "Niacinamide", "Hyaluronic Acid"] },
  {
    title: "Moisturizers",
    items: ["Day Cream", "Night Cream", "Gel Moisturizer"],
  },
  { title: "Sunscreens", items: ["SPF 50+", "Tinted SPF", "Mineral SPF"] },
  { title: "Masks", items: ["Sheet Mask", "Clay Mask", "Sleeping Mask"] },
  { title: "Treatment", items: ["Acne Care", "Brightening", "Anti Aging"] },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "#shop", hasMega: true },
  { label: "Best Seller", href: "#bestseller" },
  { label: "New Arrivals", href: "#new" },
  { label: "Collections", href: "#collections" },
  { label: "About", href: "#about" },
  { label: "Blog", href: "/blog", isRoute: true },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncAuthState = () => setIsLoggedIn(hasAccessToken());
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) handleCloseSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const handleOpenSearch = () => {
    setSearchOpen(true);
    setMobileOpen(false);
    setMegaOpen(false);
    setAccountMenuOpen(false);
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchInput("");
  };

  const handleLogout = () => {
    clearAccessToken();
    setAccountMenuOpen(false);
    navigate("/login");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass border-b border-white/40 py-3" : "bg-transparent py-5",
      )}
    >
      {/* Top bar — hidden on mobile & when searching */}
      {!scrolled && !searchOpen && (
        <div className="hidden md:block bg-foreground/95 text-background text-xs tracking-[0.2em] uppercase py-2 -mt-5 mb-3 absolute inset-x-0 top-0">
          <div className="container text-center">
            ✦ Free Shipping for Orders Above Rp 500.000 • BPOM Certified • Cruelty Free ✦
          </div>
        </div>
      )}

      {/* ── Main row ── */}
      <div
        className={cn(
          "container flex items-center justify-between gap-4",
          !scrolled && !searchOpen && "md:mt-7",
        )}
      >
        {/* Logo — always visible on all breakpoints */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Kasta<span className="text-primary italic">Beuate</span>
          </span>
        </a>

        {/* Desktop nav (lg+) — hidden when search open */}
        {!searchOpen && (
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.hasMega && setMegaOpen(true)}
                onMouseLeave={() => link.hasMega && setMegaOpen(false)}
              >
                {link.isRoute ? (
                  <Link
                    to={link.href}
                    className="story-link text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="story-link text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    {link.hasMega && <ChevronDown className="h-3 w-3" />}
                  </a>
                )}
                {link.hasMega && megaOpen && (
                  <div className="fixed left-0 right-0 top-full mt-2 px-6 animate-fade-in">
                    <div className="container">
                      <div className="glass-card p-8 grid grid-cols-3 lg:grid-cols-6 gap-6">
                        {shopCategories.map((cat) => (
                          <div key={cat.title}>
                            <h4 className="font-display text-base text-primary mb-3">{cat.title}</h4>
                            <ul className="space-y-2">
                              {cat.items.map((it) => (
                                <li key={it}>
                                  <a href="#" className="text-xs text-muted-foreground hover:text-primary story-link">
                                    {it}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}

        {/*
          Desktop search bar (lg+) — always in DOM, animates 0fr → 1fr.
          Mobile: hidden here; search renders as a full-width row below instead.
        */}
        <div
          className="hidden lg:grid min-w-0"
          style={{
            gridTemplateColumns: searchOpen ? "1fr" : "0fr",
            flex: searchOpen ? "1" : "0",
            transition:
              "grid-template-columns 350ms cubic-bezier(0.16,1,0.3,1), flex 350ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="overflow-hidden">
            <div className="relative px-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={searchInputRef}
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari produk Kasta Beaute..."
                className="pl-11 pr-4 h-11 w-full rounded-full bg-background/80 border-border/60 focus-visible:ring-primary/40 shadow-sm backdrop-blur text-sm"
                aria-label="Cari produk"
                tabIndex={searchOpen ? 0 : -1}
              />
            </div>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {/* Search toggle — visible on all breakpoints */}
          <button
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label={searchOpen ? "Tutup pencarian" : "Cari produk"}
            onClick={searchOpen ? handleCloseSearch : handleOpenSearch}
          >
            {searchOpen ? (
              <X className="h-5 w-5 text-foreground/70" />
            ) : (
              <Search className="h-5 w-5 text-foreground/70" />
            )}
          </button>

          {!searchOpen && (
            <>
              {isLoggedIn && (
                <>
                  <Link
                    to="/"
                    className="p-2 rounded-full hover:bg-accent transition-colors hidden sm:block"
                    aria-label="Wishlist"
                  >
                    <Heart className="h-5 w-5 text-foreground/70" />
                  </Link>
                  <Link
                    to="/"
                    className="p-2 rounded-full hover:bg-accent transition-colors relative"
                    aria-label="Cart"
                  >
                    <ShoppingBag className="h-5 w-5 text-foreground/70" />
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                      2
                    </span>
                  </Link>
                </>
              )}

              {isLoggedIn ? (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                    aria-label="Account"
                    onClick={() => setAccountMenuOpen((c) => !c)}
                  >
                    <User className="h-5 w-5 text-foreground/70" />
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-3 w-44 overflow-hidden rounded-2xl border border-white/40 bg-white/90 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.25)] backdrop-blur-xl animate-fade-in">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/70"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Profile
                      </Link>
                      <div className="h-px bg-border/80" />
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/5"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex h-10 items-center justify-center rounded-full border border-foreground/10 bg-white/60 px-5 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-white"
                >
                  Sign In
                </Link>
              )}

              {isLoggedIn && (
                <div className="relative sm:hidden">
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                    aria-label="Account"
                    onClick={() => setAccountMenuOpen((c) => !c)}
                  >
                    <User className="h-5 w-5 text-foreground/70" />
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-3 w-44 overflow-hidden rounded-2xl border border-white/40 bg-white/90 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.25)] backdrop-blur-xl animate-fade-in">
                      <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent/70"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <div className="h-px bg-border/80" />
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/5"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isLoggedIn && (
                <Link
                  to="/login"
                  className="inline-flex sm:hidden h-10 items-center justify-center rounded-full border border-foreground/10 bg-white/60 px-4 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-white"
                >
                  Sign In
                </Link>
              )}

              <button
                className="p-2 rounded-full hover:bg-accent transition-colors lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/*
        Mobile/Tablet search bar (< lg) — full-width slide-down row.
        Animates via grid-template-rows: 0fr → 1fr so it slides in smoothly
        without affecting the main row above.
      */}
      <div
        className="lg:hidden grid"
        style={{
          gridTemplateRows: searchOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 350ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="container pb-3 pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={searchOpen ? searchInputRef : undefined}
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari produk Kasta Beaute..."
                className="pl-11 pr-4 h-11 w-full rounded-full bg-background/80 border-border/60 focus-visible:ring-primary/40 shadow-sm backdrop-blur text-sm"
                aria-label="Cari produk"
                tabIndex={searchOpen ? 0 : -1}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search dropdown — outside overflow-hidden, works for both desktop & mobile */}
      {searchOpen && (
        <NavbarSearchDropdown
          query={debouncedSearch}
          onClose={handleCloseSearch}
        />
      )}

      {/* Mobile menu */}
      {mobileOpen && !searchOpen && (
        <div className="lg:hidden glass border-t border-white/40 mt-3 animate-fade-in">
          <nav className="container py-6 flex flex-col gap-4">
            {navLinks.map((l) =>
              l.isRoute ? (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-base font-medium text-foreground/80 hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-base font-medium text-foreground/80 hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              )
            )}
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="text-base font-medium text-primary mt-2"
                  onClick={() => setMobileOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  className="text-base font-medium text-left text-destructive mt-2"
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-base font-medium text-primary mt-2"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
