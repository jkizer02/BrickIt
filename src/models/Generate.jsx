import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api';

export default function Generate() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [voxelResolution, setVoxelResolution] = useState(45);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    
    if (file) {
      // Check if file is STL
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.stl')) {
        setError('Please select a valid STL file.');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleGenerate = () => {
    if (!selectedFile) {
      setError('Please select an STL file first.');
      return;
    }

    // Navigate to modify-model page with the file and voxel resolution
    navigate('/modify-model', { 
      state: { 
        stlFile: selectedFile,
        voxelResolution: voxelResolution
      } 
    });
  };

  const handleResolutionChange = (e) => {
    setVoxelResolution(parseInt(e.target.value));
  };

return (
    <div className="custom-container">
    <div className="row">
        <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
        <h2 className='text-center m-4'>Generate LEGO Model</h2>
        <div className="mb-3">
            <label htmlFor="stlFile" className="form-label">Upload STL File</label>
            <input 
              type="file" 
              className="form-control" 
              id="stlFile" 
              accept=".stl"
              onChange={handleFileChange}
            />
            {error && <div className="alert alert-danger mt-2">{error}</div>}
            {selectedFile && (
              <div className="alert alert-success mt-2">
                Selected: {selectedFile.name}
              </div>
            )}
        </div>
        
        <div className="mb-3">
            <label htmlFor="resolution" className="form-label">
              Voxel Resolution: {voxelResolution}
            </label>
            <input
              type="range"
              className="form-range"
              id="resolution"
              min="10"
              max="100"
              value={voxelResolution}
              onChange={handleResolutionChange}
            />
            <div className="form-text">
              Higher values = more detail and LEGO pieces ({voxelResolution} voxels along largest dimension)
            </div>
        </div>
        
        <div className="mb-3">
            <button 
              onClick={handleGenerate}
              className='btn btn-success mx-2'
              disabled={!selectedFile}
            >
              Generate LEGO Model
            </button>
            <Link to="/" className='btn btn-primary mx-2'>Back to home</Link>
        </div>
        </div>
    </div>
    </div>
)

}
