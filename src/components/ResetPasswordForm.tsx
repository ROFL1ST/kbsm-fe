import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth";

type Step = "form" | "success";

const ResetPasswordForm = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  // Token tidak ada di URL
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-display text-2xl mb-3">Link Tidak Valid</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Link reset password tidak valid atau sudah kadaluarsa.
              Silakan minta link baru.
            </p>
            <Button asChild className="w-full bg-gradient-rose hover:opacity-90">
              <Link to="/forgot-password">Minta Link Baru</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs: typeof errors = {};
    if (!newPassword) errs.newPassword = "Password baru wajib diisi.";
    else if (newPassword.length < 8) errs.newPassword = "Password minimal 8 karakter.";
    if (!confirmPassword) errs.confirmPassword = "Konfirmasi password wajib diisi.";
    else if (newPassword !== confirmPassword) errs.confirmPassword = "Password tidak cocok.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await resetPassword(token, newPassword, confirmPassword);
      setStep("success");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mereset password.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const strength = (() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  })();

  const strengthLabel = ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"][strength];
  const strengthColor = ["", "bg-destructive", "bg-orange-400", "bg-yellow-400", "bg-primary"][strength];

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
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl mb-2">Reset Password</h2>
                <p className="text-sm text-muted-foreground">
                  Buat password baru yang kuat untuk akunmu.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNew ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }}
                      className={`pr-10 ${errors.newPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showNew ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPassword && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength ? strengthColor : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        strength <= 1 ? "text-destructive" :
                        strength === 2 ? "text-orange-500" :
                        strength === 3 ? "text-yellow-600" :
                        "text-primary"
                      }`}>{strengthLabel}</p>
                    </div>
                  )}
                  {errors.newPassword && (
                    <p className="text-xs text-destructive">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      className={`pr-10 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-rose hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</>
                  ) : (
                    "Simpan Password Baru"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Login
                </Link>
              </div>
            </>
          ) : (
            /* Success */
            <div className="text-center py-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl mb-3">Password Berhasil Diubah!</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Password kamu sudah diperbarui. Silakan login dengan password baru.
              </p>
              <Button
                className="w-full bg-gradient-rose hover:opacity-90"
                onClick={() => navigate("/login")}
              >
                Login Sekarang
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
