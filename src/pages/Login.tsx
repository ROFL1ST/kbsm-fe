import { useEffect } from "react";
import LoginForm from "@/components/LoginForm";

const Login = () => {
  useEffect(() => {
    document.title = "Login - Kasta Beaute";
  }, []);

  return <LoginForm />;
};

export default Login;
