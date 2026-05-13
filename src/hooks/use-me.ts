import { useQuery } from "@tanstack/react-query";
import { getMe, hasAccessToken } from "@/lib/auth";

/**
 * Fetches the current authenticated user from GET /me.
 *
 * Intended as a session checker — call this once at the top of the app
 * so every page load/refresh validates the access token against the server.
 * If the token is expired, fetchAuth() will auto-refresh it transparently.
 * If refresh also fails, the user gets redirected to /login automatically.
 *
 * Only runs when an access token is present in localStorage.
 */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => getMe().then((res) => res.data),
    // Only fire if there's actually a token stored
    enabled: hasAccessToken(),
    // Re-validate when the tab regains focus (e.g. user comes back after a while)
    refetchOnWindowFocus: true,
    // Don't retry on error — fetchAuth already handles the refresh logic
    retry: false,
    // Cache for 5 minutes; /me is cheap but no need to hammer it
    staleTime: 5 * 60 * 1000,
  });
}
