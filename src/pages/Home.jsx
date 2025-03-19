import React from 'react'
import axios from 'axios'
import { Link,useParams } from 'react-router-dom'

export default function Home() {
  const [users, setUsers] = React.useState([]);
  React.useEffect(() => {
    loadUsers();
  }, []);

  const {id} = useParams();
  const loadUsers = async() => {
    const result = await  axios.get('http://localhost:8080/users');
    setUsers(result.data);
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:8080/user/${id}`);
    loadUsers();
  }
  return (
    <div className="container-fluid">
        <div className='py-4'>
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
    {
      users.map((user, index) => (
        <tr>
          <td scope="row" key={index}>{index+1}</td>
          <td>{user.name}</td>
          <td>{user.username}</td>
          <td>{user.email}</td>
          <td>
          <Link 
            className="btn btn-primary mx-2"
            to={`/viewuser/${user.id}`}>
              <span className="btn-view-desktop">View</span>
              <span className="btn-view-mobile">&#128065;</span>
              </Link>
            <Link 
            className="btn btn-outline-primary mx-2" 
            to={`/edituser/${user.id}`}>
              <span className="btn-edit-desktop">Edit</span>
              <span className="btn-edit-mobile">&#9998;</span>
              </Link>
            <button 
            className="btn btn-danger" 
            onClick={()=>deleteUser(user.id)}>
              <span className="btn-delete-desktop">Delete</span>
              <span className="btn-delete-mobile">&#10006;</span>
              </button>
            </td>
        </tr>
      ))
    }
    
  </tbody>
</table>
        </div>
    </div>
  )
}
