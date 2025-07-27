import React, { useEffect, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { voxelizeGeometry, createVoxelMesh, createVoxelizedModel } from '../utils/voxelizer.js';

export default function Home() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Three.js scene setup
    const scene = new THREE.Scene();
    
    // Calculate renderer size (3/4 of screen)
    const rendererWidth = Math.floor(window.innerWidth * 0.4);
    const rendererHeight = Math.floor(window.innerHeight * 0.4);
    
    const camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(rendererWidth, rendererHeight);
    renderer.setClearColor(0xf0f0f0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Append renderer to the ref element instead of document.body
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    
    // Add enhanced lighting for better detail visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Add additional lights for better illumination
    const light2 = new THREE.DirectionalLight(0xffffff, 0.4);
    light2.position.set(-10, 5, -5);
    scene.add(light2);
    
    const light3 = new THREE.PointLight(0xffffff, 0.5, 50);
    light3.position.set(0, 10, 0);
    scene.add(light3);
    
    // Create STL loader and model container
    const loadSTLModel = () => {
      const modelGroup = new THREE.Group();
      const loader = new STLLoader();
      
      // Load the STL file - using the actual file you have
      loader.load(
        '/TURTLE_STL.stl', // Updated to match your actual file
        (geometry) => {
          console.log('STL loaded successfully!');
          
          // Center the model first
          geometry.computeBoundingBox();
          const box = geometry.boundingBox;
          const center = new THREE.Vector3();
          box.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);
          
          // Create original mesh (semi-transparent)
          const material = new THREE.MeshPhongMaterial({ 
            color: 0x4a90e2,
            shininess: 100,
            specular: 0x222222,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          
          // Scale the model to fit nicely in view (made 2x bigger)
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 8.0 / maxDim; // Made 2x bigger (was 4.0)
          mesh.scale.setScalar(scale);
          
          // Rotate the turtle 270 degrees on the X-axis
          mesh.rotation.x = (3 * Math.PI) / 2; // 270 degrees in radians
          
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          // Add original mesh (semi-transparent)
          modelGroup.add(mesh);
          
          // Create voxelized version using the imported function
          const voxelMesh = createVoxelizedModel(geometry, 45, 0x00ff00);
          
          // Scale and rotate voxel mesh to match original
          voxelMesh.scale.setScalar(scale);
          voxelMesh.rotation.x = (3 * Math.PI) / 2;
          
          // Position voxels slightly offset so you can see both
          voxelMesh.position.x = 5;
          
          modelGroup.add(voxelMesh);
          scene.add(modelGroup);
          
          // Store reference for animation
          window.stlModel = modelGroup;
          
          console.log('Model added to scene with', geometry.attributes.position.count, 'vertices');
        },
        (progress) => {
          if (progress.total > 0) {
            console.log('Loading progress:', Math.round(progress.loaded / progress.total * 100) + '%');
          }
        },
        (error) => {
          console.error('Error loading STL file:', error);
          console.log('Falling back to cube...');
          // Fallback to a simple cube if STL fails to load
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
          const cube = new THREE.Mesh(geometry, material);
          cube.castShadow = true;
          cube.receiveShadow = true;
          modelGroup.add(cube);
          scene.add(modelGroup);
          window.stlModel = modelGroup;
        }
      );
      
      return modelGroup;
    };
    
    // Load the STL model
    const modelContainer = loadSTLModel();
    
    // Position camera
    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);
    
    // Animation
    const animate = () => {
      // Rotate the STL model if it's loaded
      if (window.stlModel) {
        window.stlModel.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    
    renderer.setAnimationLoop(animate);
    
    // Cleanup function
    return () => {
      renderer.setAnimationLoop(null);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="container-fluid">
      <div className="py-4">
        <h1 className="text-center">Welcome to BrickIt</h1>
        <p className="text-center">Your one-stop solution for designing your LEGO creations!</p>
        <div className="text-center">
          <Link to="/generate" className="btn btn-primary">Generate LEGO Model</Link>
          <Link to="/tour" className="btn btn-secondary ms-2">Quick Tour</Link>
        </div>
        <div className="text-center mt-4">
          <h2>Featured Models</h2>
          <p>Check out some of our featured LEGO models below:</p>
          <div ref={mountRef} style={{ margin: '20px auto', width: 'fit-content' }}></div>
        </div>
      </div>
    </div>
  );
}