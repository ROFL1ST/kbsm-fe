import { Link } from "react-router-dom";
import { CircleUserRound, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CompleteProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
};

const CompleteProfileDialog = ({
  open,
  onOpenChange,
  productName,
}: CompleteProfileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-[1.75rem] border-white/70 bg-background/95 p-0 shadow-[0_24px_80px_-32px_hsl(var(--foreground)/0.45)] backdrop-blur-xl">
        <div className="relative p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-blush blur-3xl" />

          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-rose text-white elegant-shadow">
            <CircleUserRound className="h-7 w-7" />
          </div>

          <DialogHeader className="relative space-y-3 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">
              Lengkapi Profil
            </p>
            <DialogTitle className="font-display text-3xl leading-tight">
              Isi data profil sebelum tambah ke keranjang
            </DialogTitle>
            <DialogDescription className="mx-auto max-w-sm text-sm leading-relaxed">
              {productName
                ? `Sebelum menambahkan ${productName} ke keranjang, lengkapi dulu data profil kamu.`
                : "Sebelum menambahkan produk ke keranjang, lengkapi dulu data profil kamu."}
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-6 rounded-2xl border border-border/60 bg-white/70 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Lengkapi nama, email, nomor telepon, gender, dan tanggal lahir
                agar proses belanja dan checkout bisa lanjut.
              </p>
            </div>
          </div>

          <div className="relative mt-6 grid gap-3">
            <Button
              asChild
              className="h-12 rounded-full bg-foreground text-background hover:bg-primary"
            >
              <Link to="/profile" onClick={() => onOpenChange(false)}>
                Lengkapi Profil
              </Link>
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-full text-muted-foreground hover:text-foreground"
              >
                Nanti saja
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteProfileDialog;
