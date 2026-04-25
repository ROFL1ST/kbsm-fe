/* ─────────────────────────────────────────────────────────────────────
   Profile Data — TypeScript interface, default value, localStorage helpers
   ───────────────────────────────────────────────────────────────────── */

export type Gender = "male" | "female" | "prefer_not_to_say";

export interface UserProfile {
  // id User
  user_id: string;
  /** varchar NOT NULL */
  full_name: string;
  /** varchar NULL */
  phone: string | null;
  /** text NULL */
  gender: Gender | null;
  /** varchar NULL */
  email: string | null;
  /** date NULL — ISO string "YYYY-MM-DD" */
  birth_date: string | null;
  /** text NULL — base64 data URL or remote URL */
  profile_picture: string | null;
}

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Laki-laki",
  female: "Perempuan",
  prefer_not_to_say: "Prefer not to say",
};

const STORAGE_KEY = "kasta_profile";

export const DEFAULT_PROFILE: UserProfile = {
  full_name: "Kasta Member",
  phone: null,
  gender: null,
  email: null,
  birth_date: null,
  profile_picture: null,
  user_id: null,
};

export const loadProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) } as UserProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

/** Returns age in years from an ISO date string, or null */
export const calcAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age < 0 ? null : age;
};

/** Format ISO date "YYYY-MM-DD" → Indonesian locale e.g. "14 Februari 1998" */
export const formatBirthDate = (dateStr: string | null): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/** Return initials from full name for Avatar fallback */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
};
