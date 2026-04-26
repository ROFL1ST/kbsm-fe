import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { loginUser, saveAccessToken, saveAuthUser } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";

const LOGIN_UNAUTHORIZED_MESSAGES = new Set(["unauthorized", "Unauthorized"]);

const LoginForm = () => {
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

    setIsSubmitting(true);

    try {
      const loginResponse = await loginUser({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      saveAccessToken(loginResponse.data.access_token);
      saveAuthUser(loginResponse.data.user);
      toast.success("Login berhasil.");
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login gagal.";
      toast.error(
        LOGIN_UNAUTHORIZED_MESSAGES.has(message)
          ? "Email atau password kamu salah."
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
          <LockKeyhole className="h-6 w-6 text-white" />
        </div>
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">
          Welcome Back
        </p>
        <h2 className="font-display text-4xl leading-tight text-foreground">
          Masuk Akun
        </h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
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
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              to="/forgot-password"
              className="story-link text-xs font-medium text-primary"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter"
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

        <Button
          type="submit"
          size="lg"
          className="group h-14 w-full rounded-full bg-foreground text-background hover:bg-primary elegant-shadow"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses..." : "Masuk Sekarang"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link to="/register" className="story-link font-semibold text-primary">
          Daftar sekarang
        </Link>
      </p>
    </AuthShell>
  );
};

export default LoginForm;
