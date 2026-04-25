import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Camera,
  Edit3,
  X,
  Save,
  Sparkles,
  UserCircle,
  Shield,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

import {
  type UserProfile,
  type Gender,
  GENDER_OPTIONS,
  GENDER_LABELS,
  DEFAULT_PROFILE,
  loadProfile,
  saveProfile,
  calcAge,
  formatBirthDate,
  getInitials,
} from "@/data/profileData";
import { cn } from "@/lib/utils";

/* ─── Zod Schema ─── */

const profileSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .nullable()
    .or(z.literal(""))
    .transform((v) => v || null),
  phone: z
    .string()
    .nullable()
    .or(z.literal(""))
    .transform((v) => v || null),
  gender: z.enum(["male", "female", "prefer_not_to_say"]).nullable().optional(),
  birth_date: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v || null),
  profile_picture: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

/* ─── Info Row ─── */

const InfoRow = ({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex items-start gap-4 py-3.5 border-b border-border last:border-0">
    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-medium truncate",
          highlight ? "text-primary font-semibold" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-2.5" />
  </div>
);

/* ─── Profile Avatar (clickable for upload) ─── */

const ProfileAvatar = ({
  src,
  name,
  isEditing,
  onFileSelect,
}: {
  src: string | null;
  name: string;
  isEditing: boolean;
  onFileSelect?: (base64: string) => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onFileSelect?.(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-28 w-28 md:h-36 md:w-36 ring-4 ring-primary/25 ring-offset-4 ring-offset-background luxury-shadow">
        <AvatarImage src={src ?? undefined} alt={name} className="object-cover" />
        <AvatarFallback className="bg-gradient-rose text-primary-foreground font-display text-3xl md:text-4xl font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {isEditing && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 rounded-full bg-foreground/50 backdrop-blur-sm flex items-center justify-center gap-1.5 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300 cursor-pointer"
            aria-label="Ganti foto profil"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center elegant-shadow hover:bg-primary transition-colors border-2 border-background"
            aria-label="Upload foto"
          >
            <Camera className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────────────────────────────── */

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  /* Load from localStorage on mount */
  useEffect(() => {
    setProfile(loadProfile());
    setMounted(true);
    document.title = "Profil Saya — Kasta Beauté";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ── Form ── */
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      gender: profile.gender ?? undefined,
      birth_date: profile.birth_date ?? "",
      profile_picture: profile.profile_picture ?? undefined,
    },
  });

  /* Sync form when profile loads from localStorage */
  useEffect(() => {
    form.reset({
      full_name: profile.full_name,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      gender: profile.gender ?? undefined,
      birth_date: profile.birth_date ?? "",
      profile_picture: profile.profile_picture ?? undefined,
    });
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    const updated: UserProfile = {
      user_id: String(profile.user_id),
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      gender: (data.gender as Gender) ?? null,
      birth_date: data.birth_date ?? null,
      profile_picture: data.profile_picture ?? null,
    };
    saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    toast.success("Profil berhasil disimpan! ✨", {
      description: "Informasi profilmu telah diperbarui.",
    });
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  /* Computed values */
  const age = calcAge(profile.birth_date);
  const watchedPicture = form.watch("profile_picture");
  const displayPicture = isEditing
    ? (watchedPicture ?? null)
    : profile.profile_picture;
  const displayName = isEditing
    ? (form.watch("full_name") || profile.full_name)
    : profile.full_name;

  const GenderIcon = UserCircle;

  /* ── Skeleton while mounting ── */
  if (!mounted) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-40 pb-16 bg-gradient-luxury">
          <div className="container flex flex-col items-center gap-4">
            <Skeleton className="h-36 w-36 rounded-full" />
            <Skeleton className="h-8 w-48 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
        </section>
        <section className="py-16">
          <div className="container max-w-3xl grid gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 rounded-3xl" />
            ))}
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ════════════════════════════════════════
          HERO HEADER
      ════════════════════════════════════════ */}
      <section className="relative pt-36 md:pt-44 pb-20 overflow-hidden bg-gradient-luxury">
        {/* Decorative blobs */}
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] bg-blush rounded-full blur-3xl" />

        <div className="container relative flex flex-col items-center text-center gap-5 animate-fade-up">
          {/* Avatar */}
          <ProfileAvatar
            src={displayPicture}
            name={displayName}
            isEditing={isEditing}
            onFileSelect={(base64) =>
              form.setValue("profile_picture", base64)
            }
          />

          {/* Name */}
          <div className="space-y-1">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile.email ?? "Tambahkan email kamu"}
            </p>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {profile.gender && (
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-1.5 text-xs gap-1.5 bg-primary/10 text-primary border-primary/20"
              >
                <GenderIcon className="h-3 w-3" />
                {GENDER_LABELS[profile.gender]}
              </Badge>
            )}
            {age !== null && (
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-1.5 text-xs gap-1.5 bg-accent text-accent-foreground"
              >
                <CalendarDays className="h-3 w-3" />
                {age} tahun
              </Badge>
            )}
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1.5 text-xs gap-1.5 border-primary/30 text-primary"
            >
              <Sparkles className="h-3 w-3" />
              Kasta Member
            </Badge>
          </div>

          {/* Edit / Cancel buttons */}
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-foreground text-background hover:bg-primary gap-2 px-7 text-sm tracking-[0.12em] uppercase elegant-shadow mt-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profil
            </Button>
          ) : (
            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="rounded-full border-foreground/20 hover:bg-foreground hover:text-background gap-2 px-6 text-sm tracking-[0.12em] uppercase"
              >
                <X className="h-4 w-4" />
                Batal
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-6 text-sm tracking-[0.12em] uppercase elegant-shadow"
              >
                <Save className="h-4 w-4" />
                Simpan
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          CONTENT — VIEW vs EDIT MODE
      ════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="container max-w-3xl">
          {/* ── VIEW MODE ── */}
          {!isEditing && (
            <div className="space-y-6 animate-fade-in">
              {/* Card: Personal Info */}
              <div className="glass-card p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-full bg-gradient-rose flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="font-display text-xl">Informasi Pribadi</h2>
                </div>
                <div className="divide-y divide-border">
                  <InfoRow
                    icon={User}
                    label="Nama Lengkap"
                    value={profile.full_name || "—"}
                  />
                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={profile.email ?? "Belum diisi"}
                    highlight={!!profile.email}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Nomor Telepon"
                    value={profile.phone ?? "Belum diisi"}
                    highlight={!!profile.phone}
                  />
                </div>
              </div>

              {/* Card: Demographics */}
              <div className="glass-card p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-full bg-gradient-rose flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="font-display text-xl">Data Diri</h2>
                </div>
                <div className="divide-y divide-border">
                  <InfoRow
                    icon={GenderIcon}
                    label="Jenis Kelamin"
                    value={
                      profile.gender ? GENDER_LABELS[profile.gender] : "Belum diisi"
                    }
                    highlight={!!profile.gender}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Tanggal Lahir"
                    value={formatBirthDate(profile.birth_date)}
                    highlight={!!profile.birth_date}
                  />
                  {age !== null && (
                    <InfoRow
                      icon={Sparkles}
                      label="Usia"
                      value={`${age} tahun`}
                      highlight
                    />
                  )}
                </div>
              </div>

              {/* Card: Account */}
              <div className="glass-card p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-full bg-gradient-rose flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="font-display text-xl">Informasi Akun</h2>
                </div>
                <div className="divide-y divide-border">
                  <InfoRow
                    icon={Sparkles}
                    label="Member Tier"
                    value="Kasta Member"
                    highlight
                  />
                  <InfoRow
                    icon={Shield}
                    label="Status Akun"
                    value="Aktif"
                    highlight
                  />
                </div>
              </div>

              {/* CTA to edit */}
              <p className="text-center text-sm text-muted-foreground pt-2">
                Informasi belum lengkap?{" "}
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary story-link font-medium"
                >
                  Lengkapi sekarang →
                </button>
              </p>
            </div>
          )}

          {/* ── EDIT MODE ── */}
          {isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 animate-fade-in"
              >
                {/* Section header */}
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase text-primary">
                    <Edit3 className="h-3.5 w-3.5" />
                    Mode Edit
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">
                    Klik foto di atas untuk mengganti foto profil
                  </p>
                </div>

                {/* ── Personal Info card ── */}
                <div className="glass-card p-7 space-y-6">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-rose flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="font-display text-xl">Informasi Pribadi</h2>
                  </div>

                  <Separator />

                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                          Nama Lengkap <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Masukkan nama lengkap"
                              className="pl-10 h-12 rounded-xl bg-background border-border focus-visible:ring-primary/40"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="email@contoh.com"
                              className="pl-10 h-12 rounded-xl bg-background border-border focus-visible:ring-primary/40"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                          Nomor Telepon
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="+62 812 3456 7890"
                              className="pl-10 h-12 rounded-xl bg-background border-border focus-visible:ring-primary/40"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── Demographics card ── */}
                <div className="glass-card p-7 space-y-6">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-rose flex items-center justify-center">
                      <CalendarDays className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="font-display text-xl">Data Diri</h2>
                  </div>

                  <Separator />

                  {/* Gender */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                          Jenis Kelamin
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-background border-border focus:ring-primary/40 text-sm">
                              <SelectValue placeholder="Pilih jenis kelamin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {GENDER_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="rounded-lg text-sm py-2.5"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Birth Date */}
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                          Tanggal Lahir
                        </FormLabel>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <button
                                type="button"
                                className={cn(
                                  "flex h-12 w-full items-center rounded-xl border border-input bg-background px-3.5 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 gap-3",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                {field.value
                                  ? format(new Date(field.value), "dd MMMM yyyy", {
                                      locale: idLocale,
                                    })
                                  : "Pilih tanggal lahir"}
                              </button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 rounded-2xl border border-border shadow-lg"
                            align="start"
                          >
                            <CalendarPicker
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                );
                                setCalendarOpen(false);
                              }}
                              disabled={(date) => date > new Date()}
                              defaultMonth={
                                field.value
                                  ? new Date(field.value)
                                  : new Date(2000, 0, 1)
                              }
                              captionLayout="dropdown-buttons"
                              fromYear={1940}
                              toYear={new Date().getFullYear()}
                              className="rounded-2xl"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-full h-12 border-foreground/20 hover:bg-foreground hover:text-background text-sm tracking-[0.12em] uppercase gap-2"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4" />
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-full h-12 bg-foreground text-background hover:bg-primary text-sm tracking-[0.12em] uppercase gap-2 elegant-shadow"
                  >
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
};

export default ProfilePage;
