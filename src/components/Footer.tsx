import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const cols = [
  {
    title: "Shop",
    links: ["Best Sellers", "New Arrivals", "Serums", "Moisturizers", "Sunscreens", "Sets & Bundles"],
  },
  {
    title: "About",
    links: ["Our Story", "Ingredients", "Sustainability", "Press", "Careers", "Blog"],
  },
  {
    title: "Customer Care",
    links: ["Contact Us", "FAQs", "Shipping Info", "Returns", "Size Guide", "Track Order"],
  },
  {
    title: "Policies",
    links: ["Privacy Policy", "Terms of Service", "Refund Policy", "Cookie Policy"],
  },
];

const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-background pt-20 pb-8">
      <div className="container">
        {/* Top */}
        <div className="grid lg:grid-cols-12 gap-10 pb-16 border-b border-background/10">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-5">
            <a href="#home" className="font-display text-3xl font-semibold inline-block">
              Kasta<span className="text-primary-glow italic">Beaute</span>
            </a>
            <p className="text-background/60 text-sm leading-relaxed max-w-sm">
              Premium skincare yang menggabungkan ilmu pengetahuan modern dengan
              kekuatan alam — diciptakan untuk kulit sehat, glowing, dan terawat.
            </p>

            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="h-10 w-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <h4 className="font-display text-base mb-4 text-primary-glow">{c.title}</h4>
                <ul className="space-y-3">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-background/60 hover:text-background transition-colors"
                      >
                        {l}
                      </a>
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
            <p className="text-background/40 tracking-[0.2em] uppercase mb-3">We Accept</p>
            <div className="flex flex-wrap gap-2">
              {["VISA", "Mastercard", "Midtrans", "GoPay", "ShopeePay", "OVO", "DANA"].map((p) => (
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
            <p className="text-background/40 tracking-[0.2em] uppercase mb-3">Shipping Partners</p>
            <div className="flex flex-wrap md:justify-end gap-2">
              {["JNE", "SiCepat", "J&T", "AnterAja", "GoSend"].map((p) => (
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
