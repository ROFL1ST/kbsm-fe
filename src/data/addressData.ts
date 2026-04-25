export interface UserAddress {
  id: number;
  user_id: string;
  receiver_name: string;
  phone_number: string;
  address: string;
  province_id: number;
  city_id: number;
  district_id: number;
  subdistrict_id: number;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  postal_code: string;
  is_default: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dummy Location Data for Forms
// ─────────────────────────────────────────────────────────────────────────────

export const DUMMY_PROVINCES = [
  { id: 1, name: "DKI Jakarta" },
  { id: 2, name: "Jawa Barat" },
];

export const DUMMY_CITIES: Record<number, { id: number; name: string }[]> = {
  1: [
    { id: 11, name: "Jakarta Selatan" },
    { id: 12, name: "Jakarta Pusat" },
  ],
  2: [
    { id: 21, name: "Bandung" },
    { id: 22, name: "Bekasi" },
  ],
};

export const DUMMY_DISTRICTS: Record<number, { id: number; name: string }[]> = {
  11: [
    { id: 111, name: "Kebayoran Baru" },
    { id: 112, name: "Cilandak" },
  ],
  12: [
    { id: 121, name: "Menteng" },
    { id: 122, name: "Tanah Abang" },
  ],
  21: [
    { id: 211, name: "Coblong" },
    { id: 212, name: "Sumur Bandung" },
  ],
  22: [
    { id: 221, name: "Bekasi Selatan" },
    { id: 222, name: "Bekasi Barat" },
  ],
};

export const DUMMY_SUBDISTRICTS: Record<
  number,
  { id: number; name: string; zip: string }[]
> = {
  111: [
    { id: 1111, name: "Senayan", zip: "12190" },
    { id: 1112, name: "Melawai", zip: "12160" },
  ],
  112: [
    { id: 1121, name: "Cipete Selatan", zip: "12410" },
    { id: 1122, name: "Lebak Bulus", zip: "12440" },
  ],
  121: [
    { id: 1211, name: "Menteng", zip: "10310" },
    { id: 1212, name: "Pegangsaan", zip: "10320" },
  ],
  122: [
    { id: 1221, name: "Gelora", zip: "10270" },
    { id: 1222, name: "Kebon Kacang", zip: "10240" },
  ],
  211: [
    { id: 2111, name: "Dago", zip: "40135" },
    { id: 2112, name: "Sadang Serang", zip: "40133" },
  ],
  212: [
    { id: 2121, name: "Braga", zip: "40111" },
    { id: 2122, name: "Babakan Ciamis", zip: "40117" },
  ],
  221: [
    { id: 2211, name: "Jaka Setia", zip: "17147" },
    { id: 2212, name: "Kayuringin Jaya", zip: "17144" },
  ],
  222: [
    { id: 2221, name: "Bintara", zip: "17134" },
    { id: 2222, name: "Kranji", zip: "17135" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Local Storage Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "kasta_addresses";

const DEFAULT_ADDRESSES: UserAddress[] = [
  {
    id: 1,
    user_id: "user-1",
    receiver_name: "Amelia Sari",
    phone_number: "081234567890",
    address: "Jl. Sudirman Kav. 52-53, Gedung Kasta Lt. 10",
    province_id: 1,
    province_name: "DKI Jakarta",
    city_id: 11,
    city_name: "Jakarta Selatan",
    district_id: 111,
    district_name: "Kebayoran Baru",
    subdistrict_id: 1111,
    subdistrict_name: "Senayan",
    postal_code: "12190",
    is_default: true,
  },
];

export const getAddresses = (): UserAddress[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time, save and return default
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADDRESSES));
      return DEFAULT_ADDRESSES;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveAddresses = (addresses: UserAddress[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
};

export const addAddress = (address: Omit<UserAddress, "id">): UserAddress => {
  let addresses = getAddresses();
  
  if (address.is_default) {
    addresses = addresses.map((a) => ({ ...a, is_default: false }));
  } else if (addresses.length === 0) {
    address.is_default = true;
  }

  const newId = addresses.length > 0 ? Math.max(...addresses.map((a) => a.id)) + 1 : 1;
  const newAddress: UserAddress = { ...address, id: newId };
  
  addresses.push(newAddress);
  saveAddresses(addresses);
  return newAddress;
};

export const updateAddress = (id: number, updates: Omit<UserAddress, "id">): UserAddress | null => {
  let addresses = getAddresses();
  const index = addresses.findIndex((a) => a.id === id);
  if (index === -1) return null;

  if (updates.is_default) {
    addresses = addresses.map((a) => ({ ...a, is_default: false }));
  } else if (addresses[index].is_default) {
    // If we are unsetting the default address, and it was default,
    // we should prevent it if it's the only address, or set another one to default?
    // Actually, normally at least one address is default. Let's just follow the update for now.
  }

  addresses[index] = { ...addresses[index], ...updates, id };
  saveAddresses(addresses);
  return addresses[index];
};

export const deleteAddress = (id: number): void => {
  let addresses = getAddresses();
  const index = addresses.findIndex((a) => a.id === id);
  if (index === -1) return;

  const wasDefault = addresses[index].is_default;
  addresses.splice(index, 1);

  if (wasDefault && addresses.length > 0) {
    addresses[0].is_default = true;
  }

  saveAddresses(addresses);
};

export const setDefaultAddress = (id: number): void => {
  let addresses = getAddresses();
  addresses = addresses.map((a) => ({
    ...a,
    is_default: a.id === id,
  }));
  saveAddresses(addresses);
};
