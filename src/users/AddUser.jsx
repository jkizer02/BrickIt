import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../auth/AuthService"; // ✅ Import AuthService
import { API_BASE_URL } from '../api';

export default function AddUser() {
  let navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
  });

  const { name, username, email } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/user`, user, {
        headers: AuthService.getAuthHeader(), // ✅ Include JWT token
      });
      navigate("/");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <div className="custom-container">
      <div className="row">
        <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
          <h2 className="text-center m-4">Register User</h2>
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label htmlFor="Name" className="form-label">Name</label>
              <input type="text" className="form-control" placeholder="Enter your name"
                name="name" value={name} onChange={onInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="Username" className="form-label">Username</label>
              <input type="text" className="form-control" placeholder="Enter your username"
                name="username" value={username} onChange={onInputChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="Email" className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="Enter your email"
                name="email" value={email} onChange={onInputChange} required />
            </div>
            <button type="submit" className="btn btn-outline-primary">Submit</button>
            <Link className="btn btn-outline-danger mx-2" to="/">Cancel</Link>
          </form>
        </div>
      </div>
    </div>
  );
}