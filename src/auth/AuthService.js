import axios from "axios";

const API_URL = "http://localhost:8080/auth"; // Adjust if needed for deployment

const AuthService = {
  // ✅ Register a new user
  register: async (email, password, role) => {
    return axios.post(`${API_URL}/register`, { email, password, role });
  },

  // ✅ Log in an existing user
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data) {
      localStorage.setItem("token", response.data); // Save JWT token
    }
    return response.data;
  },

  // ✅ Log out user (remove JWT token)
  logout: () => {
    localStorage.removeItem("token");
  },

  // ✅ Check if user is authenticated (valid token exists)
  isAuthenticated: () => {
    return localStorage.getItem("token") !== null;
  },

  // ✅ Get stored token
  getToken: () => {
    return localStorage.getItem("token");
  },
};

export default AuthService;