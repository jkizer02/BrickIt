import React, { useEffect, useRef,useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { createScene, loadAndDisplayModel, startAnimation } from '../utils/sceneSetup.js';
import { API_BASE_URL } from "../api.js";   

export default function Home() {
  const mountRef = useRef(null);
  
  const [models, setModels] = useState([]);
  const { modelId } = useParams();
  // Adjustable model generation parameter - change this to control detail level
  // Higher values = more detail but more voxels, Lower values = less detail but fewer voxels
  const VOXEL_RESOLUTION = 10; // Default: 45 voxels along the largest dimension

  useEffect(() => {
    // Create the Three.js scene with all lighting and setup
    //const { scene, camera, renderer, controls, cleanup } = createScene(mountRef.current);
    
    // Load and display the STL model with voxelization
    //loadAndDisplayModel(scene, '/lighthouse_02.stl', VOXEL_RESOLUTION)
     // .then((modelGroup) => {
        // Start the animation loop with mouse controls
    //    startAnimation(renderer, scene, camera, controls);
    //  })
    //  .catch((error) => {
    //    console.error('Failed to load model:', error);
        // Start animation anyway in case of fallback
    //    startAnimation(renderer, scene, camera, controls);
    //  });
     loadModels();
    // Cleanup function
    //return cleanup;
  }, []);

  const loadModels = async () => {  
    try {
      const response = await axios.get('http://localhost:8080/models');
      console.log('Models loaded:', response.data);
      setModels(response.data);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }

  return (
    <div className="container-fluid">
      <div className="py-4">
        <h1 className="text-center">Welcome to BrickIt</h1>
        <p className="text-center">Your one-stop solution for designing your LEGO creations!</p>
        <div className="text-center">
          <Link to="/generate" className="btn btn-primary">Generate LEGO Model</Link>
          <Link to="/tour" className="btn btn-secondary ms-2">Quick Tour</Link>
        </div>
        
        <div className="mt-4">
          <table className="table table-borderless">
            <thead className="table">
              <tr>
                <th scope="col">Picture</th>
                <th scope="col">Model Name</th>
                <th scope="col">Description</th>
                <th scope="col">Tags</th>
                <th scope="col">View</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(models) && models.length > 0 ? models.map((model, index) => (
                <tr key={model.id || index}>
                  <td>
                    <img src={"lighthouse_02.png"} alt={model.title || 'Model'} style={{ width: '100px', height: '100px' }} />
                  </td>
                  <td>{model.title || 'Unknown'}</td>
                  <td>{model.description || 'No description'}</td>
                  <td>{model.tags ? model.tags.join(', ') : 'No tags'}</td>
                  <td><button className="btn btn-sm btn-primary">Download Instructions</button></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    <div className="text-muted">Loading models...</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <table></table>
      </div>
    </div>
  );
}