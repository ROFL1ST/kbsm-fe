import { useEffect } from "react";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

const ForgotPassword = () => {
  useEffect(() => {
    document.title = "Lupa Password - Kasta Beaute";
  }, []);

  return <ForgotPasswordForm />;
};

export default ForgotPassword;
