import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthService from "./AuthService";
import { API_BASE_URL } from '../api';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Tracks login state
  const navigate = useNavigate(); // ✅ Enables redirection

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // ✅ Clear previous messages
    setLoading(true); // ✅ Show loading state

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const token = response.data; // ✅ Your API returns only the raw token

      // ✅ Ensure token looks valid (JWT format)
      if (!token || token.split(".").length !== 3) {
        console.error("Invalid token received:", token);
        throw new Error("Invalid token format");
      }

      AuthService.login(token); // ✅ Store token properly

      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/"), 1500); // ✅ Redirect after 1.5 sec
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Login failed. Check your credentials.");
    } finally {
      setLoading(false); // ✅ Reset loading state
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"} {/* ✅ Show loading text */}
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;