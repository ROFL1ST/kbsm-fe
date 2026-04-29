import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/auth";

type Step = "form" | "success";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    if (!value) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format email tidak valid.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep("success");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim email reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="font-display text-3xl tracking-tight">
              Kasta<span className="gradient-text italic">Beaute</span>
            </h1>
          </Link>
        </div>

        <div className="glass-card p-8 md:p-10">
          {step === "form" ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl mb-2">Lupa Password?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset password kamu.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(validateEmail(e.target.value));
                    }}
                    className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                    autoComplete="email"
                    disabled={loading}
                  />
                  {emailError && (
                    <p className="text-xs text-destructive mt-1">{emailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-rose hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengirim...</>
                  ) : (
                    "Kirim Link Reset"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors story-link"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Login
                </Link>
              </div>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl mb-3">Email Terkirim!</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                Link reset password telah dikirim ke{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Periksa juga folder spam jika tidak menemukan emailnya.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setStep("form"); setEmail(""); }}
              >
                Kirim ulang
              </Button>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
