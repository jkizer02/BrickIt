import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../auth/AuthService";

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">MultiUserverse</Link>
        
        {/* ✅ Hamburger Menu Button (Collapsible Navigation) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ✅ Navigation Links Inside Collapsible Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* ✅ Show Add User Button only if logged in */}
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="btn btn-outline-light me-2" to="/adduser">Add User</Link>
              </li>
            )}

            {/* ✅ Show Login/Register if NOT logged in */}
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-light" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}