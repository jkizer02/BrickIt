import * as THREE from 'three';

/**
 * Voxelization function with maximum bounding cube constraint
 * @param {THREE.BufferGeometry} geometry - The geometry to voxelize
 * @param {number} maxBoundingSize - Maximum number of voxels per dimension (default: 35)
 * @returns {Object} Voxel data containing grid, dimensions, bounding box, and voxel size
 */
export const voxelizeGeometry = (geometry, maxBoundingSize = 35) => {
  console.log('Starting voxelization...');
  
  // Get bounding box
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  
  // Calculate current dimensions
  const currentSize = {
    x: bbox.max.x - bbox.min.x,
    y: bbox.max.y - bbox.min.y,
    z: bbox.max.z - bbox.min.z
  };
  
  // Find the largest dimension
  const maxCurrentDim = Math.max(currentSize.x, currentSize.y, currentSize.z);
  
  // Calculate voxel size based on maximum bounding constraint
  const voxelSize = maxCurrentDim / maxBoundingSize;
  
  console.log('Current model size:', currentSize);
  console.log('Max dimension:', maxCurrentDim);
  console.log('Calculated voxel size:', voxelSize);
  
  // Calculate grid dimensions
  const gridSize = {
    x: Math.ceil(currentSize.x / voxelSize),
    y: Math.ceil(currentSize.y / voxelSize),
    z: Math.ceil(currentSize.z / voxelSize)
  };
  
  console.log('Grid dimensions:', gridSize);
  
  // Create 3D grid
  const voxelGrid = new Array(gridSize.x);
  for (let x = 0; x < gridSize.x; x++) {
    voxelGrid[x] = new Array(gridSize.y);
    for (let y = 0; y < gridSize.y; y++) {
      voxelGrid[x][y] = new Array(gridSize.z).fill(false);
    }
  }
  
  // Get vertices and faces
  const positions = geometry.attributes.position.array;
  const vertices = [];
  for (let i = 0; i < positions.length; i += 3) {
    vertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
  }
  
  // Sample points inside each triangle and mark voxels
  for (let i = 0; i < vertices.length; i += 3) {
    const v1 = vertices[i];
    const v2 = vertices[i + 1];
    const v3 = vertices[i + 2];
    
    // Get triangle bounding box
    const minX = Math.min(v1.x, v2.x, v3.x);
    const maxX = Math.max(v1.x, v2.x, v3.x);
    const minY = Math.min(v1.y, v2.y, v3.y);
    const maxY = Math.max(v1.y, v2.y, v3.y);
    const minZ = Math.min(v1.z, v2.z, v3.z);
    const maxZ = Math.max(v1.z, v2.z, v3.z);
    
    // Check voxels in triangle bounding box
    const startX = Math.max(0, Math.floor((minX - bbox.min.x) / voxelSize));
    const endX = Math.min(gridSize.x - 1, Math.ceil((maxX - bbox.min.x) / voxelSize));
    const startY = Math.max(0, Math.floor((minY - bbox.min.y) / voxelSize));
    const endY = Math.min(gridSize.y - 1, Math.ceil((maxY - bbox.min.y) / voxelSize));
    const startZ = Math.max(0, Math.floor((minZ - bbox.min.z) / voxelSize));
    const endZ = Math.min(gridSize.z - 1, Math.ceil((maxZ - bbox.min.z) / voxelSize));
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        for (let z = startZ; z <= endZ; z++) {
          const voxelCenter = new THREE.Vector3(
            bbox.min.x + (x + 0.5) * voxelSize,
            bbox.min.y + (y + 0.5) * voxelSize,
            bbox.min.z + (z + 0.5) * voxelSize
          );
          
          // Simple point-in-triangle test (simplified)
          if (isPointNearTriangle(voxelCenter, v1, v2, v3, voxelSize)) {
            voxelGrid[x][y][z] = true;
          }
        }
      }
    }
  }
  
  console.log('Voxelization complete');
  return { voxelGrid, gridSize, bbox, voxelSize };
};

/**
 * Helper function to check if point is near triangle
 * @param {THREE.Vector3} point - Point to test
 * @param {THREE.Vector3} v1 - Triangle vertex 1
 * @param {THREE.Vector3} v2 - Triangle vertex 2
 * @param {THREE.Vector3} v3 - Triangle vertex 3
 * @param {number} threshold - Distance threshold
 * @returns {boolean} True if point is near triangle
 */
const isPointNearTriangle = (point, v1, v2, v3, threshold) => {
  // Calculate distance from point to triangle plane
  const normal = new THREE.Vector3().crossVectors(
    new THREE.Vector3().subVectors(v2, v1),
    new THREE.Vector3().subVectors(v3, v1)
  ).normalize();
  
  const distance = Math.abs(normal.dot(new THREE.Vector3().subVectors(point, v1)));
  return distance < threshold;
};

/**
 * Function to create voxel mesh from grid
 * @param {Object} voxelData - Voxel data from voxelizeGeometry
 * @param {number} color - Hex color for voxels (default: 0x00ff00)
 * @returns {THREE.Group} Group containing all voxel meshes
 */
export const createVoxelMesh = (voxelData, color = 0x00ff00) => {
  const { voxelGrid, gridSize, bbox, voxelSize } = voxelData;
  const voxelGroup = new THREE.Group();
  
  const geometry = new THREE.BoxGeometry(voxelSize * 0.9, voxelSize * 0.9, voxelSize * 0.9);
  const material = new THREE.MeshLambertMaterial({ color });
  
  let voxelCount = 0;
  for (let x = 0; x < gridSize.x; x++) {
    for (let y = 0; y < gridSize.y; y++) {
      for (let z = 0; z < gridSize.z; z++) {
        if (voxelGrid[x][y][z]) {
          const voxel = new THREE.Mesh(geometry, material);
          voxel.position.set(
            bbox.min.x + (x + 0.5) * voxelSize,
            bbox.min.y + (y + 0.5) * voxelSize,
            bbox.min.z + (z + 0.5) * voxelSize
          );
          voxel.castShadow = true;
          voxel.receiveShadow = true;
          voxelGroup.add(voxel);
          voxelCount++;
        }
      }
    }
  }
  
  console.log(`Created ${voxelCount} voxels`);
  return voxelGroup;
};

/**
 * Complete voxelization pipeline - from geometry to rendered voxels
 * @param {THREE.BufferGeometry} geometry - Input geometry
 * @param {number} maxBoundingSize - Maximum voxels per dimension
 * @param {number} color - Hex color for voxels
 * @returns {THREE.Group} Ready-to-use voxel mesh group
 */
export const createVoxelizedModel = (geometry, maxBoundingSize = 35, color = 0x00ff00) => {
  const voxelData = voxelizeGeometry(geometry, maxBoundingSize);
  return createVoxelMesh(voxelData, color);
};
