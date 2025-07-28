import React, { useEffect, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { createScene, loadAndDisplayModel, startAnimation } from '../utils/sceneSetup.js';

export default function Home() {
  const mountRef = useRef(null);
  
  // Adjustable model generation parameter - change this to control detail level
  // Higher values = more detail but more voxels, Lower values = less detail but fewer voxels
  const VOXEL_RESOLUTION = 10; // Default: 45 voxels along the largest dimension

  useEffect(() => {
    // Create the Three.js scene with all lighting and setup
    const { scene, camera, renderer, controls, cleanup } = createScene(mountRef.current);
    
    // Load and display the STL model with voxelization
    loadAndDisplayModel(scene, '/lighthouse_02.stl', VOXEL_RESOLUTION)
      .then((modelGroup) => {
        // Start the animation loop with mouse controls
        startAnimation(renderer, scene, camera, controls);
      })
      .catch((error) => {
        console.error('Failed to load model:', error);
        // Start animation anyway in case of fallback
        startAnimation(renderer, scene, camera, controls);
      });
    
    // Cleanup function
    return cleanup;
  }, [VOXEL_RESOLUTION]);

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
              <tr>
                <td>
                  <img src="/lighthouse_02.png" alt="Lighthouse Model" style={{ width: '100px', height: '100px' }} />
                </td>
                <td>Lighthouse</td>
                <td>A lighthouse set for coastal adventures</td>
                <td>Ocean</td>
                <td><button>View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <table></table>
      </div>
    </div>
  );
}