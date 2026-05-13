import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getReturnToPath, clearReturnToPath } from "@/lib/auth";

/**
 * Listen for the `auth:session-expired` custom event dispatched by
 * fetchAuth() and redirect the user to /login, showing a toast.
 *
 * Mount this hook once at the top of the component tree (e.g. in App or a
 * layout component that is always rendered).
 */
export function useSessionExpired() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleSessionExpired(event: Event) {
      const { message } = (event as CustomEvent<{ message: string }>).detail;

      toast.error(message, {
        duration: 6000,
        id: "session-expired", // prevents duplicate toasts
      });

      const returnTo = getReturnToPath();
      clearReturnToPath();

      navigate("/login", {
        replace: true,
        state: { returnTo: returnTo ?? "/" },
      });
    }

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [navigate]);
}
