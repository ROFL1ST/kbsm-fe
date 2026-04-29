import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Benefits from "@/components/Benefits";
import BestSellers from "@/components/BestSellers";
import Categories from "@/components/Categories";
import FlashSale from "@/components/FlashSale";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useEffect } from "react";
import About from "@/components/About";

const Index = () => {
  useEffect(() => {
    document.title = "Kasta Beaute — Premium Luxury Skincare for Glowing Skin";
    const meta = document.querySelector('meta[name="description"]');
    const desc =
      "Discover Kasta Beaute premium skincare. Dermatologically tested, BPOM certified, cruelty-free formulas crafted for naturally glowing skin.";

    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      {/* <About /> */}
      <Marquee />
      <Benefits />
      <BestSellers />
      <Categories />
      <FlashSale />
      <Testimonials />
      {/* <Newsletter /> */}
      <Footer />
      <WhatsAppFloat />
    </main>
  );
};

export default Index;
