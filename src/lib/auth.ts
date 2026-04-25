const API_BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

export const AUTH_TOKEN_STORAGE_KEY = "kbbu_access_token";
export const AUTH_STATE_CHANGE_EVENT = "kbbu-auth-state-change";

type ApiEnvelope<T> = {
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

function getApiBaseUrl() {
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

export function clearAccessToken() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function hasAccessToken() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
}
