import { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthShellProps = {
  children: ReactNode;
};

const AuthShell = ({ children }: AuthShellProps) => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-luxury">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-28 bottom-10 h-72 w-72 rounded-full bg-blush blur-3xl" />

      <div className="container relative flex min-h-screen items-center justify-center py-10 lg:py-10">
        <section className="w-full max-w-lg animate-scale-in">
          <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-2">
            <span className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              Kasta<span className="text-primary italic">Beaute</span>
            </span>
          </Link>

          <div className="glass-card rounded-[2rem] p-6 sm:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default AuthShell;
