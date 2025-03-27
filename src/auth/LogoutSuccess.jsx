import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login"); // ✅ Redirect to login after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer if component unmounts
  }, [navigate]);

  return (
    <div className="container text-center mt-5">
      <h2>You have been logged out.</h2>
      <p>Redirecting to login page...</p>
    </div>
  );
}