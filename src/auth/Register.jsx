import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "./AuthService";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PRIVILEGED_USER"); // Default role
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // For navigation after registration

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await AuthService.register(email, password, role);
      setMessage("✅ Registration successful! Please log in.");
      setTimeout(() => navigate("/login"), 2000); // Redirect to login after 2s
    } catch (error) {
      setMessage("❌ Registration failed. Try again.");
      console.error("Registration failed:", error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="PRIVILEGED_USER">Privileged User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Register;