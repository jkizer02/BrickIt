import * as THREE from 'three';
import jsPDF from 'jspdf';

/**
 * Creates step-by-step LEGO building instructions by generating 2D images from voxel grid data
 * @param {Object} voxelData - Voxel data containing the 3D grid array from voxelizer.js
 * @param {string} fileName - Name for the generated PDF file (default: 'lego_instructions.pdf')
 * @returns {Promise} Promise that resolves when PDF is generated
 */
export const createInstructions = async (voxelData, fileName = 'lego_instructions.pdf') => {
  try {
    console.log('Starting instruction generation from voxel grid...');
    console.log('Received voxelData:', voxelData);
    
    // Validate voxelData structure
    if (!voxelData) {
      throw new Error('voxelData is undefined or null');
    }
    
    if (!voxelData.gridSize) {
      console.error('voxelData structure:', Object.keys(voxelData));
      throw new Error('voxelData.gridSize is undefined');
    }
    
    if (!voxelData.gridSize.z) {
      console.error('gridSize structure:', voxelData.gridSize);
      throw new Error('voxelData.gridSize.z is undefined');
    }
    
    const { voxelGrid, gridSize, bbox, effectiveVoxelSize } = voxelData;
    
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let stepNumber = 1;
    let pdfPageAdded = false;
    
    // Loop through Z levels with steps of 3
    for (let currentZ = 0; currentZ < gridSize.z; currentZ += 3) {
      console.log(`Generating step ${stepNumber}: Z levels ${currentZ} to ${Math.min(currentZ + 2, gridSize.z - 1)}`);
      
      // Generate 2D image for current Z levels
      const imageDataUrl = await generate2DImage(voxelGrid, gridSize, currentZ);
      
      // Count visible voxels for this step
      let visibleCount = 0;
      for (let x = 0; x < gridSize.x; x++) {
        for (let y = 0; y < gridSize.y; y++) {
          for (let z = 0; z <= Math.min(currentZ + 2, gridSize.z - 1); z++) {
            if (voxelGrid[x][y][z]) {
              visibleCount++;
            }
          }
        }
      }
      
      // Skip this step if no voxels are visible
      if (visibleCount === 0) continue;
      
      // Add page to PDF (except for the first step)
      if (pdfPageAdded) {
        pdf.addPage();
      }
      pdfPageAdded = true;
      
      // Add title for this step
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Step ${stepNumber}`, 20, 20);
      
      // Add instruction text
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const newVoxelsCount = stepNumber > 1 ? 
        visibleCount - getPreviousVisibleCount(currentZ - 3, voxelGrid, gridSize) : 
        visibleCount;
      
      const layerText = currentZ === 0 ? 
        `Start with layer 1-3 (${visibleCount} pieces)` : 
        `Add layers ${currentZ + 1}-${Math.min(currentZ + 3, gridSize.z)} (${newVoxelsCount} new pieces)`;
      
      pdf.text(layerText, 20, 30);
      
      // Add color legend
      pdf.setFontSize(10);
      pdf.text('Color Guide:', 20, 45);
      pdf.setTextColor(0, 51, 102); // Dark blue
      pdf.text('● light blue = 1 by 1/3', 30, 55);
      pdf.setTextColor(144, 238, 144); // Light green  
      pdf.text('● red  = 1 by 1 by 2/3', 30, 65);
      pdf.setTextColor(34, 139, 34); // Dark green
      pdf.text('● yellow = 1 by 1 by 1', 30, 75);
      pdf.setTextColor(0, 0, 0); // Reset to black
      
      // Add the 2D image to PDF
      const imgWidth = 170; // Width in mm
      const imgHeight = 120; // Height in mm (adjust as needed for 2D view)
      pdf.addImage(imageDataUrl, 'PNG', 20, 85, imgWidth, imgHeight);
      
      // Add step counter at bottom
      pdf.setFontSize(8);
      pdf.text(`Page ${stepNumber} of ${Math.ceil(gridSize.z / 3)}`, 180, 280);
      
      stepNumber++;
    }
    
    // Generate and download PDF
    pdf.save(fileName);
    
    console.log(`Instructions generated successfully: ${fileName}`);
    console.log(`Total steps: ${stepNumber - 1}`);
    
    return {
      success: true,
      steps: stepNumber - 1,
      fileName: fileName
    };
    
  } catch (error) {
    console.error('Error generating instructions:', error);
    throw new Error(`Failed to generate instructions: ${error.message}`);
  }
};

/**
 * Generates a 2D image representation of voxel layers up to a specific Z level
 * @param {Array} voxelGrid - 3D voxel grid array [x][y][z]
 * @param {Object} gridSize - Grid dimensions {x, y, z}
 * @param {number} maxZ - Maximum Z level to include (inclusive of 3-layer step)
 * @returns {Promise<string>} Base64 encoded image data URL
 */
const generate2DImage = async (voxelGrid, gridSize, maxZ) => {
  // Create canvas for 2D rendering
  const canvas = document.createElement('canvas');
  const canvasSize = 800; // Square canvas
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // Calculate cell size based on larger grid dimension
  const maxGridDim = Math.max(gridSize.x, gridSize.y);
  const cellSize = Math.floor(canvasSize * 0.8 / maxGridDim); // 80% of canvas for grid
  const offsetX = (canvasSize - gridSize.x * cellSize) / 2;
  const offsetY = (canvasSize - gridSize.y * cellSize) / 2;
  
  // Define colors matching the 3D voxel colors
  const colors = {
    0: '#067ef7ff', // Dark blue (z % 3 === 0)
    1: '#f53737ff', // Light green (z % 3 === 1)  
    2: '#d6e40fff'  // Dark green (z % 3 === 2)
  };
  
  // Define edge colors for each cube type
  const edgeColors = {
    0: '#000000ff', // Darker blue edge for dark blue cubes
    1: '#000000ff', // Darker green edge for light green cubes
    2: '#000000ff'  // Very dark green edge for dark green cubes
  };
  
  // Draw grid (top-down view, X-Y plane)
  for (let x = 0; x < gridSize.x; x++) {
    for (let y = 0; y < gridSize.y; y++) {
      // Check if any voxel exists in this X-Y position within the current 3 Z layers only
      let hasVoxel = false;
      let topVoxelZ = -1;
      
      // Only look at the current 3 Z layers (maxZ, maxZ+1, maxZ+2)
      for (let z = maxZ; z <= Math.min(maxZ + 2, gridSize.z - 1); z++) {
        if (voxelGrid[x][y][z]) {
          hasVoxel = true;
          topVoxelZ = z; // Keep track of the topmost voxel in this range
        }
      }
      
      if (hasVoxel) {
        // Use color based on the topmost voxel's Z position
        const colorIndex = topVoxelZ % 3;
        ctx.fillStyle = colors[colorIndex];
        
        // Draw filled rectangle for this voxel position
        const drawX = offsetX + x * cellSize;
        const drawY = offsetY + y * cellSize;
        ctx.fillRect(drawX, drawY, cellSize - 1, cellSize - 1); // -1 for grid lines
        
        // Add border with specific edge color for this cube type
        ctx.strokeStyle = edgeColors[colorIndex];
        ctx.lineWidth = 2; // Thicker border for better visibility
        ctx.strokeRect(drawX, drawY, cellSize - 1, cellSize - 1);
      }
    }
  }
  
  // Add title and axis labels
  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Current Layers: ${maxZ + 1}-${Math.min(maxZ + 3, gridSize.z)} (Top View)`, canvasSize / 2, 30);
  
  // Add coordinate labels
  ctx.font = '12px Arial';
  ctx.fillText('X →', canvasSize - 50, canvasSize / 2);
  ctx.save();
  ctx.translate(30, canvasSize / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('← Y', 0, 0);
  ctx.restore();
  
  return canvas.toDataURL('image/png');
};

/**
 * Helper function to count visible voxels up to a specific Z level using voxel grid
 * @param {number} maxZ - Maximum Z level to count
 * @param {Array} voxelGrid - 3D voxel grid array [x][y][z]
 * @param {Object} gridSize - Grid dimensions {x, y, z}
 * @returns {number} Count of visible voxels
 */
const getPreviousVisibleCount = (maxZ, voxelGrid, gridSize) => {
  let count = 0;
  for (let x = 0; x < gridSize.x; x++) {
    for (let y = 0; y < gridSize.y; y++) {
      for (let z = 0; z <= Math.min(maxZ + 2, gridSize.z - 1); z++) {
        if (voxelGrid[x][y][z]) {
          count++;
        }
      }
    }
  }
  return count;
};

/**
 * Creates a preview of the instructions without generating the full PDF
 * @param {Object} voxelData - Voxel data containing the 3D grid array from voxelizer.js
 * @returns {Array} Array of image data URLs for preview
 */
export const previewInstructions = async (voxelData) => {
  try {
    console.log('Starting preview generation from voxel grid...');
    console.log('Received voxelData for preview:', voxelData);
    
    // Validate voxelData structure
    if (!voxelData) {
      throw new Error('voxelData is undefined or null');
    }
    
    if (!voxelData.gridSize) {
      console.error('voxelData structure:', Object.keys(voxelData));
      throw new Error('voxelData.gridSize is undefined');
    }
    
    const images = [];
    const { voxelGrid, gridSize } = voxelData;
  
  // Generate only first 3 steps for preview
  const maxSteps = Math.min(3, Math.ceil(gridSize.z / 3));
  
  for (let step = 0; step < maxSteps; step++) {
    const currentZ = step * 3;
    
    // Generate 2D image for this step
    const imageDataUrl = await generate2DImage(voxelGrid, gridSize, currentZ);
    images.push(imageDataUrl);
  }
  
  return images;
  
  } catch (error) {
    console.error('Error generating instruction preview:', error);
    throw new Error(`Failed to generate preview: ${error.message}`);
  }
};
