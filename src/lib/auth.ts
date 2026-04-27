const API_BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

export const AUTH_TOKEN_STORAGE_KEY = "kbbu_access_token";
export const AUTH_USER_STORAGE_KEY = "kbbu_auth_user";
export const AUTH_STATE_CHANGE_EVENT = "kbbu-auth-state-change";

export type ApiEnvelope<T> = {
  status: boolean;
  message: string;
  data: T | null;
  error: string | null;
};

type RegisterResponseData = {
  id: string;
  email: string;
  created_at: string;
};

type LoginResponseData = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    created_at: string;
  };
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("KBBU_API belum dikonfigurasi.");
  }

  return API_BASE_URL;
}

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Server mengembalikan response yang bukan JSON valid.");
  }
}

async function postJson<T>(path: string, body: AuthCredentials): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await readJsonSafely<ApiEnvelope<T>>(response);

  if (!payload) {
    throw new Error("Server mengembalikan response kosong.");
  }

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(payload.error || payload.message || "Request gagal diproses.");
  }

  return payload;
}

async function postAnyJson<T, TBody extends object>(
  path: string,
  body: TBody,
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await readJsonSafely<ApiEnvelope<T>>(response);

  if (!payload) {
    throw new Error("Server mengembalikan response kosong.");
  }

  if (!response.ok || !payload.status) {
    throw new Error(payload.error || payload.message || "Request gagal diproses.");
  }

  return payload;
}

export async function registerUser(credentials: AuthCredentials) {
  return postJson<RegisterResponseData>("/auth/register", credentials);
}

export async function loginUser(credentials: AuthCredentials) {
  return postJson<LoginResponseData>("/auth/login", credentials);
}

export function saveAccessToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function saveAuthUser(user: { id: string; email: string; created_at: string }) {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAccessToken() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function hasAccessToken() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getAuthUser(): { id: string; email: string; created_at: string } | null {
  const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function fetchAuth<T>(path: string, options?: RequestInit): Promise<ApiEnvelope<T>> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Token otentikasi tidak ditemukan. Silakan login kembali.");
  }

  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type") && options?.method && options.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  const payload = await readJsonSafely<ApiEnvelope<T>>(response);

  if (!payload) {
    throw new Error("Server mengembalikan response kosong.");
  }

  if (!response.ok || !payload.status) {
    throw new Error(payload.error || payload.message || "Request gagal diproses.");
  }

  return payload;
}
