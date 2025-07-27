import axios from 'axios';
import React from 'react'
import { Link,useParams } from 'react-router-dom'
import { API_BASE_URL } from '../api';

export default function Generate() {

return (
    <div className="custom-container">
    <div className="row">
        <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
        <h2 className='text-center m-4'>Generate LEGO Model</h2>
            <Link to="/" className='btn btn-primary my-2'>Back to home</Link>
        </div>
    </div>
    </div>
)

}
