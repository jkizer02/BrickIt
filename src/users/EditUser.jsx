import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthService from "../auth/AuthService"; // ✅ Import AuthService

export default function EditUser() {
  let navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
  });

  const { name, username, email } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    loadUser();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/user/${id}`, user, {
        headers: AuthService.getAuthHeader(), // ✅ Include JWT token
      });
      navigate("/");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const loadUser = async () => {
    try {
      const result = await axios.get(`http://localhost:8080/user/${id}`, {
        headers: AuthService.getAuthHeader(), // ✅ Include JWT token
      });
      setUser(result.data);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  return (
    <div className="custom-container">
      <div className="row">
        <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
          <h2 className="text-center m-4">Edit User</h2>
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