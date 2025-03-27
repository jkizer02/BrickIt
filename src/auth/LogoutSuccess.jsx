import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // ✅ Redirects to home page after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // ✅ Cleanup function to clear timeout
  }, [navigate]);

  return (
    <div className="container text-center mt-5">
      <h2>You have been logged out</h2>
      <p>Redirecting to the home page...</p>
    </div>
  );
}