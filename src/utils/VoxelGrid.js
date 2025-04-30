class VoxelGrid {
  constructor(size = 9) { // Default to 9x9x9 grid for -4 to +4 coordinate system
    this.size = size;
    this.grid = Array(size).fill().map(() => 
      Array(size).fill().map(() => 
        Array(size).fill(0)
      )
    );
    
    // Voxel types:
    // 0: Empty
    // 1: Pink/Magenta (border)
    // 2: Dark Blue (internal structure)
    // 3: Light Blue (bottom layer)
    // 4: White (special blocks)
  }

  setVoxel(x, y, z, type = 1) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size && z >= 0 && z < this.size) {
      this.grid[x][y][z] = type;
    }
  }
  
  // Helper to convert from -4 to +4 coordinate system to 0-8 internal grid
  setVoxelCoord(x, y, z, type = 1) {
    const offset = Math.floor(this.size / 2);
    this.setVoxel(x + offset, y + offset, z + offset, type);
  }

  getVoxel(x, y, z) {
    return this.grid[x]?.[y]?.[z] || 0;
  }

  clear() {
    this.grid = Array(this.size).fill().map(() => 
      Array(this.size).fill().map(() => 
        Array(this.size).fill(0)
      )
    );
  }

  // Get a string representation of the grid for comparison
  getGridString() {
    let str = '';
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          str += this.getVoxel(x, y, z);
        }
      }
    }
    return str;
  }

  // Count the number of voxels
  getVoxelCount() {
    let count = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          count += this.getVoxel(x, y, z);
        }
      }
    }
    return count;
  }
}

export default VoxelGrid;
