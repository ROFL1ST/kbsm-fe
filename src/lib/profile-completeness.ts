import type { UserProfile } from "@/data/profileData";
import { getAuthUser } from "@/lib/auth";

const DEFAULT_DISPLAY_NAME = "Kasta Member";

function hasText(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isProfileComplete(profile: UserProfile | null | undefined) {
  if (!profile) {
    return false;
  }

  const resolvedEmail = profile.email ?? getAuthUser()?.email ?? null;

  return (
    hasText(profile.full_name) &&
    profile.full_name.trim() !== DEFAULT_DISPLAY_NAME &&
    hasText(resolvedEmail) &&
    hasText(profile.phone) &&
    Boolean(profile.gender) &&
    hasText(profile.birth_date)
  );
}
