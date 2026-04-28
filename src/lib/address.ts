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
  subdistrict_id: number | null;   // kecamatan
  district_id: number | null;      // kelurahan
  province_name: string;
  city_name: string;
  subdistrict_name: string | null; // kecamatan
  district_name: string | null;    // kelurahan
  postal_code: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

/* ── Raw shapes returned by the API ── */
interface RawRegion   { id: number; name: string }
interface RawDistrict { id: number; name: string; zip_code: string }

/* ── Normalised types used inside the app ── */
export interface ApiProvince    { province_id: number; province: string }
export interface ApiCity        { city_id: number; city_name: string }
export interface ApiSubdistrict { subdistrict_id: number; subdistrict_name: string }
export interface ApiDistrict    { district_id: number; district_name: string; zip_code: string }

/* ── Normalise helpers ── */
const toProvince    = (r: RawRegion):   ApiProvince    => ({ province_id: r.id,    province: r.name })
const toCity        = (r: RawRegion):   ApiCity        => ({ city_id: r.id,         city_name: r.name })
const toSubdistrict = (r: RawRegion):   ApiSubdistrict => ({ subdistrict_id: r.id,  subdistrict_name: r.name })
const toDistrict    = (r: RawDistrict): ApiDistrict    => ({ district_id: r.id,     district_name: r.name, zip_code: r.zip_code })

/* ── Address CRUD ── */
export async function getUserAddresses(userId: string): Promise<ApiAddress[]> {
  const payload = await fetchAuth<ApiAddress[]>(`/auth/user-addresses?user_id=${userId}`);
  return payload.data ?? [];
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

export async function createUserAddress(
  data: Omit<ApiAddress, "id" | "created_at" | "updated_at">
): Promise<ApiAddress> {
  const payload = await fetchAuth<ApiAddress>("/auth/user-addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!payload.data) throw new Error(payload.message || "Gagal menyimpan alamat.");
  return payload.data;
}

export async function updateUserAddress(
  data: Omit<ApiAddress, "created_at" | "updated_at">
): Promise<ApiAddress> {
  const payload = await fetchAuth<ApiAddress>("/auth/user-addresses", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!payload.data) throw new Error(payload.message || "Gagal memperbarui alamat.");
  return payload.data;
}

export async function deleteUserAddress(userId: string, addressId: number | string): Promise<void> {
  const payload = await fetchAuth<unknown>(
    `/auth/user-addresses?user_id=${userId}&id=${addressId}`,
    { method: "DELETE" }
  );
  if (!(payload as { status?: boolean }).status)
    throw new Error((payload as { message?: string }).message || "Gagal menghapus alamat.");
}

/* ── Regional lookups (normalised) ── */
export async function getApiProvinces(): Promise<ApiProvince[]> {
  const payload = await fetchAuth<RawRegion[]>("/auth/provinces", { method: "GET" });
  return (payload.data ?? []).map(toProvince);
}

export async function getApiCities(provinceId: string | number): Promise<ApiCity[]> {
  const payload = await fetchAuth<RawRegion[]>(
    `/auth/provinces/cities?province_id=${provinceId}`,
    { method: "GET" }
  );
  return (payload.data ?? []).map(toCity);
}

export async function getApiSubdistricts(cityId: string | number): Promise<ApiSubdistrict[]> {
  const payload = await fetchAuth<RawRegion[]>(
    `/auth/provinces/cities/subdistricts?city_id=${cityId}`,
    { method: "GET" }
  );
  return (payload.data ?? []).map(toSubdistrict);
}

export async function getApiDistricts(subdistrictId: string | number): Promise<ApiDistrict[]> {
  const payload = await fetchAuth<RawDistrict[]>(
    `/auth/provinces/cities/subdistricts/districts?subdistrict_id=${subdistrictId}`,
    { method: "GET" }
  );
  return (payload.data ?? []).map(toDistrict);
}
