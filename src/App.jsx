import React from "react";
import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
import AddUser from "./users/AddUser";
import EditUser from "./users/EditUser";
import ViewUser from "./users/ViewUser";
import Login from "./auth/Login";
import Register from "./auth/Register";
import LogoutSuccess from "./auth/LogoutSuccess"; // ✅ Import new logout page
import AuthService from "./auth/AuthService";

const ProtectedRoute = ({ element, requiredRoles }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const userRole = AuthService.getUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout-success" element={<LogoutSuccess />} /> {/* ✅ New route */}

          <Route path="/adduser" element={<ProtectedRoute element={<AddUser />} requiredRoles={["ADMIN"]} />} />
          <Route path="/edituser/:id" element={<ProtectedRoute element={<EditUser />} requiredRoles={["ADMIN", "PRIVILEGED_USER"]} />} />
          <Route path="/viewuser/:id" element={<ProtectedRoute element={<ViewUser />} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;