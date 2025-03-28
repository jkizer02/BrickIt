import axios from 'axios';
import React from 'react'
import { Link,useParams } from 'react-router-dom'
import { API_BASE_URL } from '../api';

export default function ViewUser() {
    const [user, setUser] = React.useState({ 
        name: '',
        username: '',
        email: ''
    });

    const {id} = useParams();
    React.useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async() => { 
        const result = await axios.get(`${API_BASE_URL}/user/${id}`);
        setUser(result.data);
    };

return (
    <div className="custom-container">
    <div className="row">
        <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
        <h2 className='text-center m-4'>User Details</h2>
            <div className='card'>
                <div className='card-header'>
                    User details of user id : {user.id}
                    <ul className='list-group list-group-flush'>
                        <li className='list-group-item'>
                            <b>Name: </b>
                            {user.name}
                        </li>
                        <li className='list-group-item'>
                            <b>Username: </b>
                            {user.username}
                        </li>
                        <li className='list-group-item'>
                            <b>E-mail: </b>
                            {user.email}
                        </li>
                    </ul>
                </div>
            </div>
            <Link to="/" className='btn btn-primary my-2'>Back to home</Link>
        </div>
    </div>
    </div>
)

}
