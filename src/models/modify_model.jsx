import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { createScene, loadAndDisplayModel, startAnimation } from '../utils/sceneSetup.js';
import { voxelizeGeometry } from '../utils/voxelizer.js';
import { createInstructions, previewInstructions } from '../utils/create_instructions.js';

export default function ModifyModel() {
  const mountRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the STL file and initial voxel resolution from the route state
  const stlFile = location.state?.stlFile;
  const initialResolution = location.state?.voxelResolution || 45;
  
  const [voxelResolution, setVoxelResolution] = useState(initialResolution);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState('');
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false);
  
  // Store references to Three.js objects for instruction generation
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelGroupRef = useRef(null);
  const voxelDataRef = useRef(null);

  useEffect(() => {
    // Redirect if no file was provided
    if (!stlFile) {
      navigate('/generate');
      return;
    }

    // Create a URL for the uploaded file
    const fileUrl = URL.createObjectURL(stlFile);
    
    // Create the Three.js scene
    const { scene, camera, renderer, controls, cleanup } = createScene(mountRef.current);
    
    // Store references for instruction generation
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    
    // Load and display the uploaded STL model
    loadAndDisplayModel(scene, fileUrl, voxelResolution)
      .then((modelGroup) => {
        setModelLoaded(true);
        modelGroupRef.current = modelGroup;
        startAnimation(renderer, scene, camera, controls);
      })
      .catch((error) => {
        console.error('Failed to load model:', error);
        setError('Failed to load the STL file. Please try again.');
        startAnimation(renderer, scene, camera, controls);
      });
    
    // Cleanup function
    return () => {
      cleanup();
      URL.revokeObjectURL(fileUrl);
    };
  }, [stlFile, voxelResolution, navigate, initialResolution]);

  const handleResolutionChange = (e) => {
    setVoxelResolution(parseInt(e.target.value));
  };

  const handleExportInstructions = async () => {
    if (!modelLoaded || !stlFile) {
      setError('Model not ready for export. Please wait for loading to complete.');
      return;
    }

    setIsGeneratingInstructions(true);
    setError('');

    try {
      // Load the STL file and voxelize it directly
      const fileUrl = URL.createObjectURL(stlFile);
      const loader = new STLLoader();
      
      // Load geometry
      const geometry = await new Promise((resolve, reject) => {
        loader.load(
          fileUrl,
          (geometry) => resolve(geometry),
          undefined,
          (error) => reject(error)
        );
      });
      
      // Clean up the URL
      URL.revokeObjectURL(fileUrl);
      
      // Voxelize the geometry to get the actual voxel data
      const voxelData = voxelizeGeometry(geometry, voxelResolution);
      
      console.log('Voxel data for instructions:', voxelData);
      
      const fileName = `${stlFile.name.replace('.stl', '')}_instructions.pdf`;
      
      const result = await createInstructions(voxelData, fileName);

      console.log('Instructions generated:', result);
      
    } catch (error) {
      console.error('Error generating instructions:', error);
      setError(`Failed to generate instructions: ${error.message}`);
    } finally {
      setIsGeneratingInstructions(false);
    }
  };

  if (!stlFile) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="py-4">
        <h1 className="text-center">Modify LEGO Model</h1>
        <p className="text-center">File: {stlFile.name}</p>
        
        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Model Settings</h5>
                
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
                    Higher values = more detail, more pieces
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}

                {modelLoaded && (
                  <div className="alert alert-success">
                    Model loaded successfully!
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary" 
                    disabled={!modelLoaded || isGeneratingInstructions}
                    onClick={handleExportInstructions}
                  >
                    {isGeneratingInstructions ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating Instructions...
                      </>
                    ) : (
                      'Export LEGO Instructions'
                    )}
                  </button>
                  <Link to="/generate" className="btn btn-secondary">
                    Upload Different File
                  </Link>
                  <Link to="/" className="btn btn-outline-primary">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-9">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">3D Model Preview</h5>
                <div ref={mountRef} style={{ 
                  width: '100%', 
                  height: '500px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem'
                }}></div>
                <div className="mt-2 text-muted small">
                  <strong>Mouse Controls:</strong><br/>
                  • Left click + drag: Rotate view<br/>
                  • Right click + drag: Pan view<br/>
                  • Scroll wheel: Zoom in/out<br/><br/>
                  <strong>Model:</strong> Semi-transparent: Original<br/>
                  <strong>LEGO Blocks:</strong> Dark Blue, Light Green, Dark Green (alternating by layer)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}