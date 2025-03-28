import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import AuthService from "../auth/AuthService"; // ✅ Import AuthService to check roles
import { API_BASE_URL } from '../api';

export default function Home() {
  const [users, setUsers] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await axios.get(`${API_BASE_URL}/users`);
    setUsers(result.data);
  };

  const deleteUser = async (id) => {
    await axios.delete(`${API_BASE_URL}/user/${id}`, {
      headers: AuthService.getAuthHeader(),
    });
    loadUsers();
  };

  // ✅ Get authentication status and user role
  const isAuthenticated = AuthService.isAuthenticated();
  const userRole = AuthService.getUserRole();

  return (
    <div className="container-fluid">
      <div className="py-4">
        <table className="table border shadow">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Username</th>
              <th scope="col">Email</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}> 
                <th scope="row">{index + 1}</th>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  {/* ✅ View button is always visible */}
                  <Link className="btn btn-primary mx-2" to={`/viewuser/${user.id}`}>
                    <span className="btn-edit-desktop">View</span>
                    <span className="btn-edit-mobile">&#128065;</span>
                  </Link>

                  {/* ✅ Show Edit button for Admins & Privileged Users */}
                  {isAuthenticated && (userRole === "ADMIN" || userRole === "PRIVILEGED_USER") && (
                    <Link className="btn btn-outline-primary mx-2" to={`/edituser/${user.id}`}>
                      <span className="btn-edit-desktop">Edit</span>
                      <span className="btn-edit-mobile">&#9998;</span>
                    </Link>
                  )}

                  {/* ✅ Show Delete button ONLY for Admins */}
                  {isAuthenticated && userRole === "ADMIN" && (
                    <button className="btn btn-danger mx-2" onClick={() => deleteUser(user.id)}>
                      <span className="btn-delete-desktop">Delete</span>
                      <span className="btn-delete-mobile">&#10006;</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}