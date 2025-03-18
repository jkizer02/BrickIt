import { Button } from 'bootstrap'
import React, {useState }from 'react'

export default function AddUser() {
    const [user, setUser] = React.useState({
        name: '',
        username: '',
        email: ''
    });
    const {name, username, email} = user;
    const onInputChange = e => {
        setUser({...user, [e.target.name]: e.target.value});
    }
  return (
    <div className="custom-container">
        <div className="row">
            <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
            <h2 className='text-center m-4'>Register User</h2>
            <div className="mb-3">
                <label htmlFor="Name" className="form-label">
                    Name
                </label>
                <input type={"text"} className="form-control" placeholder='enter your name' name='name' value={name} onChange={(e)=>onInputChange(e)}/>
           </div>
           <div className="mb-3">
                <label htmlFor="Username" className="form-label">
                    Username
                </label>
                <input type={"text"} className="form-control" placeholder='enter your username' name='username' value={username} onChange={(e)=>onInputChange(e)}/>
           </div>
           <div className="mb-3">
                <label htmlFor="Name" className="form-label">
                    E-mail
                </label>
                <input type={"text"} className="form-control" placeholder='enter your e-mail address' name='email' value={email} onChange={(e)=>onInputChange(e)}/>
           </div>
           <button type="submit" className='btn btn-outline-primary'>Submit</button>
           <button type="submit" className='btn btn-outline-danger mx-2'>Cancel</button>
            </div>
        </div>
    </div>
  )
}
