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
  
  // Calculate grid dimensions with 3x resolution in Z direction for LEGO brick proportions
  const gridSize = {
    x: Math.ceil(currentSize.x / voxelSize),
    y: Math.ceil(currentSize.y / voxelSize),
    z: Math.ceil(currentSize.z / (voxelSize / 3)) // 3x finer resolution in Z
  };
  
  // Calculate effective voxel sizes for each dimension
  const effectiveVoxelSize = {
    x: voxelSize,
    y: voxelSize,
    z: voxelSize / 3 // Z voxels are 1/3 the size
  };
  
  console.log('Grid dimensions:', gridSize);
  console.log('Effective voxel sizes:', effectiveVoxelSize);
  
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
    
    // Check voxels in triangle bounding box using effective voxel sizes
    const startX = Math.max(0, Math.floor((minX - bbox.min.x) / effectiveVoxelSize.x));
    const endX = Math.min(gridSize.x - 1, Math.ceil((maxX - bbox.min.x) / effectiveVoxelSize.x));
    const startY = Math.max(0, Math.floor((minY - bbox.min.y) / effectiveVoxelSize.y));
    const endY = Math.min(gridSize.y - 1, Math.ceil((maxY - bbox.min.y) / effectiveVoxelSize.y));
    const startZ = Math.max(0, Math.floor((minZ - bbox.min.z) / effectiveVoxelSize.z));
    const endZ = Math.min(gridSize.z - 1, Math.ceil((maxZ - bbox.min.z) / effectiveVoxelSize.z));
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        for (let z = startZ; z <= endZ; z++) {
          const voxelCenter = new THREE.Vector3(
            bbox.min.x + (x + 0.5) * effectiveVoxelSize.x,
            bbox.min.y + (y + 0.5) * effectiveVoxelSize.y,
            bbox.min.z + (z + 0.5) * effectiveVoxelSize.z
          );
          
          // Simple point-in-triangle test (simplified)
          if (isPointNearTriangle(voxelCenter, v1, v2, v3, Math.min(effectiveVoxelSize.x, effectiveVoxelSize.y, effectiveVoxelSize.z))) {
            voxelGrid[x][y][z] = true;
          }
        }
      }
    }
  }
  
  console.log('Voxelization complete');
  return { voxelGrid, gridSize, bbox, voxelSize, effectiveVoxelSize };
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
 * Function to create voxel mesh from grid with LEGO-style brick proportions
 * @param {Object} voxelData - Voxel data from voxelizeGeometry
 * @param {number} color - Hex color for voxels (default: 0x00ff00)
 * @param {Object} brickDimensions - Custom brick dimensions {width, length, height} (default: LEGO proportions)
 * @returns {THREE.Group} Group containing all voxel meshes
 */
export const createVoxelMesh = (voxelData, color = 0x00ff00, brickDimensions = null) => {
  const { voxelGrid, gridSize, bbox, voxelSize, effectiveVoxelSize } = voxelData;
  const voxelGroup = new THREE.Group();
  
  // Default LEGO-style brick dimensions: 1 wide × 1 tall × 1/3 deep
  const defaultDimensions = {
    width: voxelSize * 0.9,   // X dimension
    length: voxelSize * 0.3,  // Z dimension (1/3 depth)
    height: voxelSize * 0.9   // Y dimension  
  };
  
  const dimensions = brickDimensions || defaultDimensions;
  
  // BoxGeometry parameters: (width, height, depth) = (X, Y, Z)
  const geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.length);
  
  // Define the three alternating colors based on Z position
  const colors = {
    0: 0x003366, // Dark blue (z % 3 === 0)
    1: 0x90EE90, // Light green (z % 3 === 1)  
    2: 0x228B22  // Dark green (z % 3 === 2)
  };
  
  // Create materials for each color
  const materials = {
    0: new THREE.MeshLambertMaterial({ color: colors[0] }),
    1: new THREE.MeshLambertMaterial({ color: colors[1] }),
    2: new THREE.MeshLambertMaterial({ color: colors[2] })
  };
  
  let voxelCount = 0;
  for (let x = 0; x < gridSize.x; x++) {
    for (let y = 0; y < gridSize.y; y++) {
      for (let z = 0; z < gridSize.z; z++) {
        if (voxelGrid[x][y][z]) {
          // Determine color based on z position modulo 3
          const colorIndex = z % 3;
          const material = materials[colorIndex];
          
          const voxel = new THREE.Mesh(geometry, material);
          voxel.position.set(
            bbox.min.x + (x + 0.5) * effectiveVoxelSize.x,
            bbox.min.y + (y + 0.5) * effectiveVoxelSize.y,
            bbox.min.z + (z + 0.5) * effectiveVoxelSize.z
          );
          voxel.castShadow = true;
          voxel.receiveShadow = true;
          voxelGroup.add(voxel);
          voxelCount++;
        }
      }
    }
  }
  
  console.log(`Created ${voxelCount} LEGO-style voxels with alternating colors based on Z position`);
  console.log('Color scheme: Z%3=0 (Dark Blue), Z%3=1 (Light Green), Z%3=2 (Dark Green)');
  return voxelGroup;
};

/**
 * Complete voxelization pipeline - from geometry to rendered voxels
 * @param {THREE.BufferGeometry} geometry - Input geometry
 * @param {number} maxBoundingSize - Maximum voxels per dimension
 * @param {number} color - Hex color for voxels
 * @param {Object} brickDimensions - Custom brick dimensions {width, length, height}
 * @returns {THREE.Group} Ready-to-use voxel mesh group
 */
export const createVoxelizedModel = (geometry, maxBoundingSize = 35, color = 0x00ff00, brickDimensions = null) => {
  const voxelData = voxelizeGeometry(geometry, maxBoundingSize);
  return createVoxelMesh(voxelData, color, brickDimensions);
};
