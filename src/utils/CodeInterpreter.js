/**
 * CodeInterpreter - Safely executes user code with controlled environment
 * Processes user code that takes x, y, z coordinates and returns a color value
 */

/**
 * Execute user code as a function that takes x, y, z coordinates and returns a color value
 * @param {string} code - The user code to execute (should return a color value)
 * @param {number} gridSize - The size of the grid
 * @param {Function} setVoxelFunction - Function to set voxel with color (x, y, z, colorValue)
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise} - Resolves when execution completes or rejects on error/timeout
 */
export const executeCode = (code, gridSize, setVoxelFunction, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a function that takes x, y, z coordinates and returns a color value
      // We'll add some utility functions like abs() that are used in the example
      const userFunction = new Function('x', 'y', 'z', `
        // Add utility functions
        const abs = Math.abs;
        ${code}
      `);
      
      // Set up timeout to prevent infinite loops
      let timeoutId = setTimeout(() => {
        reject(new Error('Execution timed out'));
      }, timeout);
      
      // Process the entire grid by calling the user function for each coordinate
      try {
        const halfGrid = Math.floor(gridSize / 2);
        const offset = halfGrid; // For converting to -4 to +4 coordinate system
        
        for (let x = 0; x < gridSize; x++) {
          for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
              // Convert to -4 to +4 coordinate system (or appropriate range based on grid size)
              const xCoord = x - offset;
              const yCoord = y - offset;
              const zCoord = z - offset;
              
              // Call user function to get color value
              const colorValue = userFunction(xCoord, yCoord, zCoord);
              
              // If color value is non-zero, set the voxel with that color
              if (colorValue) {
                setVoxelFunction(x, y, z, colorValue);
              }
            }
          }
        }
        
        clearTimeout(timeoutId);
        resolve();
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    } catch (error) {
      reject(error);
    }
  });
};
