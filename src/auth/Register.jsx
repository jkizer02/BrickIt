import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthService from "./AuthService";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PRIVILEGED_USER"); // Default role
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Tracks registration state
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(""); // ✅ Clear previous messages
    setLoading(true); // ✅ Show loading state

    try {
      await AuthService.register(email, password, role);
      setMessage("✅ Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500); // ✅ Redirect after 1.5 sec
    } catch (error) {
      setMessage("❌ Registration failed. Email may already be in use.");
    } finally {
      setLoading(false); // ✅ Reset loading state
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="PRIVILEGED_USER">Privileged User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"} {/* ✅ Show loading text */}
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Register;