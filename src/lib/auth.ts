const API_BASE_URL = import.meta.env.KBBU_API?.replace(/\/$/, "");

export const {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_HASHED_USER_ID_STORAGE_KEY,
  AUTH_STATE_CHANGE_EVENT,
} = import.meta.env;

const AUTH_REFRESH_TOKEN_KEY = "auth_refresh_token";
const AUTH_RETURN_TO_KEY = "auth_return_to";

export type ApiEnvelope<T> = {
  status: boolean;
  message: string;
  data: T | null;
  error: string | null;
  code?: string;
};

type RegisterResponseData = {
  id: string;
  email: string;
  created_at: string;
};

type LoginResponseData = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    created_at: string;
  };
};

type RefreshResponseData = {
  access_token: string;
  refresh_token?: string;
};

export type AuthUser = LoginResponseData["user"];

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

async function postJson<T>(
  path: string,
  body: AuthCredentials,
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

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(
      payload.error || payload.message || "Request gagal diproses.",
    );
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
    throw new Error(
      payload.error || payload.message || "Request gagal diproses.",
    );
  }

  return payload;
}

export async function registerUser(credentials: AuthCredentials) {
  return postJson<RegisterResponseData>("/auth/register", credentials);
}

export async function loginUser(credentials: AuthCredentials) {
  return postJson<LoginResponseData>("/auth/login", credentials);
}

// ---------- Forgot Password ----------
export async function forgotPassword(
  email: string,
): Promise<ApiEnvelope<null>> {
  return postAnyJson<null, { email: string }>("/auth/forgot-password", {
    email,
  });
}

// ---------- Reset Password ----------
export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
): Promise<ApiEnvelope<null>> {
  return postAnyJson<
    null,
    { token: string; new_password: string; confirm_password: string }
  >("/auth/reset-password", {
    token,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
}

let authUserCache: AuthUser | null = null;

async function hashValue(value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function saveAccessToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function saveRefreshToken(token: string) {
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken() {
  return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
}

export function clearRefreshToken() {
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
}

export async function saveHashedAuthUserId(userId: string) {
  const hashedUserId = await hashValue(userId);
  localStorage.setItem(AUTH_HASHED_USER_ID_STORAGE_KEY, hashedUserId);
  return hashedUserId;
}

export async function saveAuthUser(user: AuthUser) {
  authUserCache = user;
  await saveHashedAuthUserId(user.id);
}

export function getHashedAuthUserId() {
  return localStorage.getItem(AUTH_HASHED_USER_ID_STORAGE_KEY);
}

export function clearAccessToken() {
  authUserCache = null;
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_HASHED_USER_ID_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function hasAccessToken() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

function getAuthUserFromToken(): AuthUser | null {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const tokenParts = token.split(".");
  if (tokenParts.length < 2) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(tokenParts[1])) as Record<
      string,
      unknown
    >;
    const id =
      typeof payload.user_id === "string"
        ? payload.user_id
        : typeof payload.id === "string"
          ? payload.id
          : typeof payload.sub === "string"
            ? payload.sub
            : null;

    if (!id) {
      return null;
    }

    return {
      id,
      email: typeof payload.email === "string" ? payload.email : "",
      created_at:
        typeof payload.created_at === "string" ? payload.created_at : "",
    };
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthUser | null {
  if (authUserCache) {
    return authUserCache;
  }

  const decodedUser = getAuthUserFromToken();
  authUserCache = decodedUser;
  return decodedUser;
}

// ---------- Return-to path ----------
export function saveReturnToPath(path: string) {
  sessionStorage.setItem(AUTH_RETURN_TO_KEY, path);
}

export function getReturnToPath(): string | null {
  return sessionStorage.getItem(AUTH_RETURN_TO_KEY);
}

export function clearReturnToPath() {
  sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
}

// ---------- Logout helper (clears all auth state) ----------
export function logoutUser() {
  clearAccessToken();
  clearRefreshToken();
}

// ---------- Refresh token ----------
// Single in-flight refresh promise to prevent parallel refresh storms.
let _refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Refresh token tidak tersedia.");
  }

  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const payload =
    await readJsonSafely<ApiEnvelope<RefreshResponseData>>(response);

  if (!payload || !response.ok || !payload.status || !payload.data) {
    throw new Error(
      payload?.error || payload?.message || "Refresh token gagal.",
    );
  }

  const { access_token, refresh_token } = payload.data;
  saveAccessToken(access_token);
  if (refresh_token) {
    saveRefreshToken(refresh_token);
  }

  return access_token;
}

/**
 * Ensures at most one refresh request is in-flight at any time.
 * Concurrent callers wait for the same promise.
 */
function getOrStartRefresh(): Promise<string> {
  if (!_refreshPromise) {
    _refreshPromise = refreshAccessToken().finally(() => {
      _refreshPromise = null;
    });
  }
  return _refreshPromise;
}

/**
 * Detects whether a 401 response from the API indicates an expired token
 * (as opposed to a truly unauthorized request).
 *
 * Strategy (in order of priority):
 *  1. code === "TOKEN_EXPIRED"  — explicit field from BE
 *  2. message/error contains "expired" keywords — BE returns plain strings
 *  3. Any 401 while a refresh token is still stored — last-resort fallback
 */
function isExpiredTokenResponse(payload: ApiEnvelope<null> | null): boolean {
  // 1. Explicit code
  if (payload?.code === "TOKEN_EXPIRED") return true;

  // 2. Match keywords in message or error string
  const expiredKeywords = /expired|invalid.*(token|or expired)/i;
  if (payload?.message && expiredKeywords.test(payload.message)) return true;
  if (
    payload?.error &&
    typeof payload.error === "string" &&
    expiredKeywords.test(payload.error)
  )
    return true;

  // 3. Last-resort: no code field at all but refresh token exists
  if (!payload?.code && Boolean(getRefreshToken())) return true;

  return false;
}

// ---------- Authenticated fetch with auto-refresh interceptor ----------
export async function fetchAuth<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Token otentikasi tidak ditemukan. Silakan login kembali.");
  }

  const buildHeaders = (accessToken: string): Headers => {
    const headers = new Headers(options?.headers);
    if (
      !headers.has("Content-Type") &&
      options?.method &&
      options.method !== "GET"
    ) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Authorization", `Bearer ${accessToken}`);
    return headers;
  };

  // --- First attempt ---
  const firstResponse = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: buildHeaders(token),
  });

  // Fast path: success
  if (firstResponse.ok) {
    const payload = await readJsonSafely<ApiEnvelope<T>>(firstResponse);
    if (!payload) throw new Error("Server mengembalikan response kosong.");
    if (!payload.status) {
      throw new Error(
        payload.error || payload.message || "Request gagal diproses.",
      );
    }
    return payload;
  }

  // --- Handle 401 ---
  if (firstResponse.status === 401) {
    const errPayload =
      await readJsonSafely<ApiEnvelope<null>>(firstResponse);

    if (isExpiredTokenResponse(errPayload)) {
      let newToken: string;
      try {
        newToken = await getOrStartRefresh();
      } catch {
        // Refresh failed → logout and redirect to login
        const returnTo = window.location.pathname + window.location.search;
        if (returnTo !== "/login") {
          saveReturnToPath(returnTo);
        }
        logoutUser();
        window.dispatchEvent(
          new CustomEvent("auth:session-expired", {
            detail: {
              message:
                "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.",
            },
          }),
        );
        throw new Error(
          "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.",
        );
      }

      // --- Retry original request with new token ---
      const retryResponse = await fetch(`${getApiBaseUrl()}${path}`, {
        ...options,
        headers: buildHeaders(newToken),
      });

      const retryPayload =
        await readJsonSafely<ApiEnvelope<T>>(retryResponse);
      if (!retryPayload)
        throw new Error("Server mengembalikan response kosong.");
      if (!retryResponse.ok || !retryPayload.status) {
        throw new Error(
          retryPayload.error ||
            retryPayload.message ||
            "Request gagal diproses.",
        );
      }
      return retryPayload;
    }

    // 401 but NOT token-expired (truly unauthorized) → reject normally
    throw new Error(
      errPayload?.error ||
        errPayload?.message ||
        "Tidak memiliki akses. Silakan login kembali.",
    );
  }

  // --- All other non-ok responses ---
  const payload = await readJsonSafely<ApiEnvelope<T>>(firstResponse);
  if (!payload) throw new Error("Server mengembalikan response kosong.");
  throw new Error(
    payload.error || payload.message || "Request gagal diproses.",
  );
}
