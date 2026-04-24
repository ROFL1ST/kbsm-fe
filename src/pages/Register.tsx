import { useEffect } from "react";
import RegisterForm from "@/components/RegisterForm";

const Register = () => {
  useEffect(() => {
    document.title = "Register - Kasta Beaute";
  }, []);

  return <RegisterForm />;
};

export default Register;
