import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createVoxelizedModel } from './voxelizer.js';

/**
 * Creates and configures a Three.js scene with camera, renderer, and lighting
 * @param {HTMLElement} mountElement - DOM element to attach the renderer to
 * @param {number} widthRatio - Width ratio of screen (default: 0.4)
 * @param {number} heightRatio - Height ratio of screen (default: 0.4)
 * @returns {Object} Object containing scene, camera, renderer, and cleanup function
 */
export const createScene = (mountElement, widthRatio = 0.5, heightRatio = 0.6) => {
  // Three.js scene setup
  const scene = new THREE.Scene();
  
  // Calculate renderer size
  const rendererWidth = Math.floor(window.innerWidth * widthRatio);
  const rendererHeight = Math.floor(window.innerHeight * heightRatio);
  
  const camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(rendererWidth, rendererHeight);
  renderer.setClearColor(0xf0f0f0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Append renderer to the provided element
  if (mountElement) {
    mountElement.appendChild(renderer.domElement);
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
  
  // Position camera
  camera.position.set(6, 6, 6);
  camera.lookAt(0, 0, 0);
  
  // Add OrbitControls for mouse interaction
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth camera movements
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableRotate = true;
  controls.autoRotate = false; // Disable auto rotation
  
  // Cleanup function
  const cleanup = () => {
    renderer.setAnimationLoop(null);
    controls.dispose(); // Clean up controls
    if (mountElement && renderer.domElement && mountElement.contains(renderer.domElement)) {
      mountElement.removeChild(renderer.domElement);
    }
    renderer.dispose();
  };
  
  return {
    scene,
    camera,
    renderer,
    controls,
    cleanup
  };
};

/**
 * Loads and displays an STL model with voxelization
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {string} modelPath - Path to the STL file
 * @param {number} voxelResolution - Resolution for voxelization
 * @param {Object} options - Additional options for model display
 * @returns {Promise} Promise that resolves when model is loaded
 */
export const loadAndDisplayModel = (scene, modelPath, voxelResolution = 45, options = {}) => {
  const {
    showOriginal = true,
    showVoxelized = true,
    originalOpacity = 0.3,
    voxelColor = 0x00ff00,
    rotation = { x: (3 * Math.PI) / 2, y: 0, z: 0 },
    offset = { x: 5, y: 0, z: 0 }
  } = options;

  return new Promise((resolve, reject) => {
    const modelGroup = new THREE.Group();
    const loader = new STLLoader();
    
    loader.load(
      modelPath,
      (geometry) => {
        console.log('STL loaded successfully!');
        
        // Center the model first
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const center = new THREE.Vector3();
        box.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);
        
        // Calculate scale
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 8.0 / maxDim;
        
        // Create original mesh (semi-transparent) if requested
        if (showOriginal) {
          const material = new THREE.MeshPhongMaterial({ 
            color: 0x4a90e2,
            shininess: 100,
            specular: 0x222222,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: originalOpacity
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.scale.setScalar(scale);
          mesh.rotation.set(rotation.x, rotation.y, rotation.z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          modelGroup.add(mesh);
        }
        
        // Create voxelized version if requested
        if (showVoxelized) {
          // Calculate brick dimensions based on resolution
          const baseBrickSize = maxDim / voxelResolution;
          const brickDimensions = {
            width: baseBrickSize * 0.9,
            length: baseBrickSize * 0.3,
            height: baseBrickSize * 0.9
          };
          
          const voxelMesh = createVoxelizedModel(
            geometry, 
            voxelResolution, 
            voxelColor, 
            brickDimensions
          );
          
          voxelMesh.scale.setScalar(scale);
          voxelMesh.rotation.set(rotation.x, rotation.y, rotation.z);
          voxelMesh.position.set(offset.x, offset.y, offset.z);
          modelGroup.add(voxelMesh);
        }
        
        scene.add(modelGroup);
        console.log('Model added to scene with', geometry.attributes.position.count, 'vertices');
        resolve(modelGroup);
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
        resolve(modelGroup);
      }
    );
  });
};

/**
 * Creates an animation loop for the scene with mouse controls
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - The Three.js camera
 * @param {OrbitControls} controls - The OrbitControls instance
 * @param {Function} customAnimations - Optional custom animation function to run each frame
 */
export const startAnimation = (renderer, scene, camera, controls, customAnimations = null) => {
  const animate = () => {
    // Update controls for smooth damping
    controls.update();
    
    // Run custom animations if provided
    if (customAnimations) {
      customAnimations();
    }
    
    renderer.render(scene, camera);
  };
  
  renderer.setAnimationLoop(animate);
};
