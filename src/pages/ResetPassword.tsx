import { useEffect } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

const ResetPassword = () => {
  useEffect(() => {
    document.title = "Reset Password - Kasta Beaute";
  }, []);

  return <ResetPasswordForm />;
};

export default ResetPassword;
