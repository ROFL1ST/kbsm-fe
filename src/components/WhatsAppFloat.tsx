import { MessageCircle } from "lucide-react";

const WhatsAppFloat = () => (
  <a
    href="https://wa.me/6281234567890"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-6 right-6 z-40 group"
  >
    <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
    <span className="relative flex items-center justify-center h-14 w-14 rounded-full bg-gradient-rose text-white luxury-shadow group-hover:scale-110 transition-transform">
      <MessageCircle className="h-6 w-6" />
    </span>
  </a>
);

export default WhatsAppFloat;
