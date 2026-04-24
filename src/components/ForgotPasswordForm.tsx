import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { forgotPassword, sendResetPasswordEmail } from "@/lib/auth";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Email wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await forgotPassword(trimmedEmail);

      if (!response.data?.reset_token) {
        throw new Error("Reset token tidak tersedia.");
      }

      await sendResetPasswordEmail({
        email: trimmedEmail,
        resetToken: response.data.reset_token,
      });

      toast.success("Email reset password berhasil dikirim.");
      setEmail("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memproses lupa password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-rose elegant-shadow">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">
          Password Recovery
        </p>
        <h2 className="font-display text-4xl leading-tight text-foreground">
          Lupa Password
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Masukkan email akun kamu. Kami akan kirim link reset password.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="forgot-email"
              type="email"
              placeholder="nama@email.com"
              className="h-12 rounded-full border-white/70 bg-white/70 pl-11"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="group h-14 w-full rounded-full bg-foreground text-background hover:bg-primary elegant-shadow"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Sudah ingat password?{" "}
        <Link to="/login" className="story-link font-semibold text-primary">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPasswordForm;
