import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { loginUser, resetPassword, saveAccessToken } from "@/lib/auth";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get("token")?.trim() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedPassword = newPassword.trim();

    if (!token) {
      toast.error("Token reset password tidak ditemukan.");
      return;
    }

    if (!email) {
      toast.error("Email tidak ditemukan pada link reset password.");
      return;
    }

    if (!trimmedPassword) {
      toast.error("Password baru wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        new_password: trimmedPassword,
      });

      const loginResponse = await loginUser({
        email,
        password: trimmedPassword,
      });

      saveAccessToken(loginResponse.data.access_token);
      toast.success("Password berhasil direset dan kamu sudah login.");
      setNewPassword("");
      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mereset password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-rose elegant-shadow">
          <LockKeyhole className="h-6 w-6 text-white" />
        </div>
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">
          Secure Reset
        </p>
        <h2 className="font-display text-4xl leading-tight text-foreground">
          Password Baru
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Masukkan password baru untuk akun kamu.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="reset-password">Password Baru</Label>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter"
              className="h-12 rounded-full border-white/70 bg-white/70 px-11"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
              disabled={isSubmitting}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="group h-14 w-full rounded-full bg-foreground text-background hover:bg-primary elegant-shadow"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses..." : "Simpan Password Baru"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Kembali ke{" "}
        <Link to="/login" className="story-link font-semibold text-primary">
          login
        </Link>
      </p>
    </AuthShell>
  );
};

export default ResetPasswordForm;
