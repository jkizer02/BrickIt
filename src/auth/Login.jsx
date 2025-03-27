import { useState } from "react";
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
      await AuthService.login(email, password);
      setMessage("Login successful!");
      navigate("/"); // Redirect to homepage after login
    } catch (error) {
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