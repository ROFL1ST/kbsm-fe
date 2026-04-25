import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { loginUser, registerUser, saveAccessToken } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";

const MIN_PASSWORD_LENGTH = 6;
const REGISTER_CONFLICT_MESSAGES = new Set(["conflict", "Email already registered"]);

const RegisterForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Email dan password wajib diisi.");
      return;
    }

    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      const loginResponse = await loginUser({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      saveAccessToken(loginResponse.data.access_token);
      toast.success("Registrasi berhasil.");
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registrasi gagal.";
      toast.error(
        REGISTER_CONFLICT_MESSAGES.has(message)
          ? "Email ini sudah digunakan."
          : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-rose elegant-shadow">
          <User className="h-6 w-6 text-white" />
        </div>
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">
          Create Account
        </p>
        <h2 className="font-display text-4xl leading-tight text-foreground">
          Daftar Member
        </h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-email"
              type="email"
              placeholder="nama@email.com"
              className="h-12 rounded-full border-white/70 bg-white/70 pl-11"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`}
              className="h-12 rounded-full border-white/70 bg-white/70 px-11"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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

        <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-input accent-primary"
            disabled={isSubmitting}
          />
          Saya setuju dengan Terms of Service dan Privacy Policy Kasta Beaute.
        </label>

        <Button
          type="submit"
          size="lg"
          className="group h-14 w-full rounded-full bg-foreground text-background hover:bg-primary elegant-shadow"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses..." : "Buat Akun"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link to="/login" className="story-link font-semibold text-primary">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
};

export default RegisterForm;
