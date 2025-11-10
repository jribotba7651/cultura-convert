import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SPARecovery = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const key = "SPA_REDIRECT";
      const pending = sessionStorage.getItem(key);
      if (pending) {
        sessionStorage.removeItem(key);
        navigate(pending, { replace: true });
      }
    } catch (e) {
      // ignore
    }
  }, [navigate]);

  return null;
};

export default SPARecovery;
