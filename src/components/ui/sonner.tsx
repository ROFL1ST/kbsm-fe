import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      visibleToasts={3}
      offset="1rem"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:w-[min(calc(100vw-2rem),420px)] group-[.toaster]:rounded-2xl group-[.toaster]:border-white/70 group-[.toaster]:bg-background/95 group-[.toaster]:px-4 group-[.toaster]:py-4 group-[.toaster]:text-foreground group-[.toaster]:shadow-[0_18px_55px_-28px_hsl(var(--foreground)/0.55)] group-[.toaster]:backdrop-blur-xl",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-snug",
          description: "group-[.toast]:text-sm group-[.toast]:leading-relaxed group-[.toast]:text-muted-foreground",
          icon: "group-[.toast]:text-primary",
          success: "group-[.toaster]:border-primary/20",
          error: "group-[.toaster]:border-destructive/20",
          actionButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
