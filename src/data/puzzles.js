export const puzzles = [
  // 3D Coordinate System Model
  {
    id: 0,
    title: "3D Coordinate System Model",
    description: "A 3D model showing a coordinate system with X, Y, Z axes and different colored blocks.",
    size: 9, // -4 to +4 coordinate system
    setup: (grid) => {
      // Create the outer shell (pink/magenta)
      for (let i = -4; i <= 4; i++) {
        for (let j = -4; j <= 4; j++) {
          // Bottom face (y = -4)
          grid.setVoxelCoord(i, -4, j, 1);
          // Top face (y = 4)
          grid.setVoxelCoord(i, 4, j, 1);
          
          // Front and back faces (z = -4, z = 4)
          if (i >= -3 && i <= 3 && j >= -3 && j <= 3) {
            for (let y = -3; y <= 3; y++) {
              grid.setVoxelCoord(i, y, -4, 1);
              grid.setVoxelCoord(i, y, 4, 1);
            }
          }
          
          // Left and right faces (x = -4, x = 4)
          if (j >= -3 && j <= 3) {
            for (let y = -3; y <= 3; y++) {
              grid.setVoxelCoord(-4, y, j, 1);
              grid.setVoxelCoord(4, y, j, 1);
            }
          }
        }
      }
      
      // Create the bottom platform (light blue)
      for (let x = -3; x <= 3; x++) {
        for (let z = -3; z <= 3; z++) {
          grid.setVoxelCoord(x, -3, z, 3);
        }
      }
      
      // Create the inner structure (dark blue)
      for (let x = -3; x <= 3; x++) {
        for (let z = -3; z <= 3; z++) {
          for (let y = -2; y <= 2; y++) {
            // Skip positions that will have white blocks
            if (Math.abs(x) === 2 || Math.abs(z) === 2) continue;
            grid.setVoxelCoord(x, y, z, 2);
          }
        }
      }
      
      // Add white blocks at specific positions
      for (let y = -2; y <= 2; y++) {
        // X = 2 face
        grid.setVoxelCoord(2, y, -2, 4);
        grid.setVoxelCoord(2, y, -1, 4);
        grid.setVoxelCoord(2, y, 0, 4);
        grid.setVoxelCoord(2, y, 1, 4);
        grid.setVoxelCoord(2, y, 2, 4);
        
        // X = -2 face
        grid.setVoxelCoord(-2, y, -2, 4);
        grid.setVoxelCoord(-2, y, -1, 4);
        grid.setVoxelCoord(-2, y, 0, 4);
        grid.setVoxelCoord(-2, y, 1, 4);
        grid.setVoxelCoord(-2, y, 2, 4);
        
        // Z = 2 face
        grid.setVoxelCoord(-1, y, 2, 4);
        grid.setVoxelCoord(0, y, 2, 4);
        grid.setVoxelCoord(1, y, 2, 4);
        
        // Z = -2 face
        grid.setVoxelCoord(-1, y, -2, 4);
        grid.setVoxelCoord(0, y, -2, 4);
        grid.setVoxelCoord(1, y, -2, 4);
      }
    }
  },
  // Hollow Cube
  {
    id: 1,
    title: "Puzzle 2: Hollow Cube",
    description: "Create a 5x5x5 hollow cube by placing voxels only on the outer shell.",
    size: 5,
    setup: (grid) => {
      const size = 5;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          for (let z = 0; z < size; z++) {
            if (x === 0 || x === size-1 || 
                y === 0 || y === size-1 || 
                z === 0 || z === size-1) {
              grid.setVoxel(x, y, z);
            }
          }
        }
      }
    }
  },
  // Pyramid
  {
    id: 2,
    title: "Puzzle 3: Pyramid",
    description: "Create a pyramid structure with a 5x5 base, decreasing in size as it goes up.",
    size: 5,
    setup: (grid) => {
      const size = 5;
      for (let layer = 0; layer < size; layer++) {
        const offset = Math.floor((size - 1 - layer) / 2);
        for (let x = 0; x < layer + 1; x++) {
          for (let y = 0; y < layer + 1; y++) {
            grid.setVoxel(x + offset, y + offset, layer);
          }
        }
      }
    }
  }
];
