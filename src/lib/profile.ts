import { fetchAuth, getApiBaseUrl, getAuthToken, getAuthUser, type ApiEnvelope } from "./auth";
import { UserProfile } from "@/data/profileData";

export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const payload = await fetchAuth<UserProfile>(`/auth/user-detail?user_id=${userId}`);
    
    if (!payload.data) {
      throw new Error("not found"); // Simulate catch below
    }
    
    return payload.data;
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : "";
    if (msg.includes("not found") || msg.includes("kosong") || msg.includes("gagal")) {
      const user = getAuthUser();
      // Return fallback profile
      return {
        user_id: userId,
        full_name: "",
        email: user?.email || null,
        phone: null,
        gender: null,
        birth_date: null,
        profile_picture: null,
      };
    }
    throw err;
  }
}

export async function updateUserProfile(data: {
  user_id: string;
  full_name: string;
  phone?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  profile_picture?: File | null;
}): Promise<UserProfile> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Token otentikasi tidak ditemukan. Silakan login kembali.");
  }

  const formData = new FormData();
  formData.append("user_id", data.user_id);
  formData.append("full_name", data.full_name);
  
  if (data.phone) formData.append("phone", data.phone);
  if (data.gender) formData.append("gender", data.gender);
  if (data.birth_date) formData.append("birth_date", data.birth_date);
  if (data.profile_picture) formData.append("profile_picture", data.profile_picture);

  const response = await fetch(`${getApiBaseUrl()}/auth/user-detail`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      // Do NOT set Content-Type header when using FormData. The browser will set it automatically with the boundary.
    },
    body: formData,
  });

  let payload: ApiEnvelope<UserProfile>;
  try {
    const text = await response.text();
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Server mengembalikan response yang bukan JSON valid.");
  }

  if (!payload) {
    throw new Error("Server mengembalikan response kosong.");
  }

  if (!response.ok || !payload.status) {
    throw new Error(payload.error || payload.message || "Gagal memperbarui profil.");
  }

  if (!payload.data) {
    throw new Error("Data profil tidak dikembalikan oleh server.");
  }

  return payload.data;
}
