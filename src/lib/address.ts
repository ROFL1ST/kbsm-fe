import { fetchAuth } from "./auth";

export interface ApiAddress {
  id: number;
  user_id: string;
  receiver_name: string;
  phone_number: string;
  address: string;
  label: string;
  province_id: number;
  city_id: number;
  district_id: number | null;
  subdistrict_id: number | null;
  province_name: string;
  city_name: string;
  district_name: string | null;
  subdistrict_name: string | null;
  postal_code: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiProvince {
  province_id: number;
  province: string;
  active: boolean;
}

export interface ApiCity {
  city_id: number;
  province_id: number;
  province: string;
  city_name: string;
  active: boolean;
}

export interface ApiSubdistrict {
  subdistrict_id: number;
  province_id: number;
  province: string;
  city_id: number;
  city: string;
  subdistrict_name: string;
  active: boolean;
}

export async function getUserAddresses(userId: string): Promise<ApiAddress[]> {
  const payload = await fetchAuth<ApiAddress[]>(`/auth/user-addresses?user_id=${userId}`);
  
  if (!payload.data) {
    return [];
  }
  
  return payload.data;
}

export async function getDefaultUserAddress(userId: string): Promise<ApiAddress | null> {
  const payload = await fetchAuth<ApiAddress | ApiAddress[]>(`/auth/user-addresses?user_id=${userId}&is_default=true`);

  if (!payload.data) {
    return null;
  }

  if (Array.isArray(payload.data)) {
    return payload.data[0] ?? null;
  }

  return payload.data;
}

export async function createUserAddress(data: Omit<ApiAddress, "id" | "created_at" | "updated_at">): Promise<ApiAddress> {
  const payload = await fetchAuth<ApiAddress>("/auth/user-addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!payload.data) {
    throw new Error(payload.message || "Gagal menyimpan alamat.");
  }

  return payload.data;
}

export async function updateUserAddress(data: Omit<ApiAddress, "created_at" | "updated_at">): Promise<ApiAddress> {
  const payload = await fetchAuth<ApiAddress>("/auth/user-addresses", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!payload.data) {
    throw new Error(payload.message || "Gagal memperbarui alamat.");
  }

  return payload.data;
}

export async function deleteUserAddress(userId: string, addressId: number | string): Promise<void> {
  const payload = await fetchAuth<unknown>(`/auth/user-addresses?user_id=${userId}&id=${addressId}`, {
    method: "DELETE",
  });

  if (!payload.status) {
    throw new Error(payload.message || "Gagal menghapus alamat.");
  }
}

export async function getApiProvinces(): Promise<ApiProvince[]> {
  const payload = await fetchAuth<ApiProvince[]>("/auth/provinces", { method: "GET" });
  return payload.data || [];
}

export async function getApiCities(provinceId: string | number): Promise<ApiCity[]> {
  const payload = await fetchAuth<ApiCity[]>(`/auth/provinces/cities?province_id=${provinceId}`, { method: "GET" });
  return payload.data || [];
}

export async function getApiSubdistricts(cityId: string | number): Promise<ApiSubdistrict[]> {
  const payload = await fetchAuth<ApiSubdistrict[]>(`/auth/provinces/cities/subdistricts?city_id=${cityId}`, { method: "GET" });
  return payload.data || [];
}
