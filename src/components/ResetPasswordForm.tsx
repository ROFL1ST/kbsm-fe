import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPassword = newPassword.trim();

    if (!trimmedPassword) {
      toast.error("Password baru wajib diisi.");
      return;
    }

    toast.error("Fitur reset password belum tersedia.");
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

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
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
        >
          Simpan Password Baru
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
