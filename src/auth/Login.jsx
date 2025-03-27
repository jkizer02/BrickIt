import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthService from "./AuthService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // For navigation after login

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
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
      setMessage("Login successful!");

      // ✅ Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login failed. Check your credentials.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Login;