import React, { useEffect } from "react";
import OAuth from "./oauth";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
        const code = searchParams.get("code");

        if (code) {
            await OAuth.updateAuthorization(code);
            navigate("/");
        }
    }

    handleAuth();
  }, [navigate, searchParams]);

  return <p>Logging in...</p>;
}
