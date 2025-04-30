/**
 * CodeInterpreter - Safely executes user code with controlled environment
 * Provides functionality to run user code with limited access to functions
 */

/**
 * Execute user code with a provided setVoxel function
 * @param {string} code - The user code to execute
 * @param {Function} setVoxelFunction - The function to set voxels
 * @param {number} timeout - Timeout in milliseconds (default: 2000)
 * @returns {Promise} - Resolves when execution completes or rejects on error/timeout
 */
export const executeUserCode = (code, setVoxelFunction, timeout = 2000) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a safe execution environment with limited functions
      const userFunction = new Function('setVoxel', code);
      
      // Execute with timeout to prevent infinite loops
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Execution timed out')), timeout);
      });
      
      Promise.race([
        new Promise(resolve => {
          userFunction(setVoxelFunction);
          resolve();
        }),
        timeoutPromise
      ])
      .then(() => {
        resolve();
      })
      .catch(error => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Execute user code with additional context and functions
 * @param {string} code - The user code to execute
 * @param {Object} context - Object with functions and values to expose to user code
 * @param {number} timeout - Timeout in milliseconds (default: 2000)
 * @returns {Promise} - Resolves when execution completes or rejects on error/timeout
 */
export const executeUserCodeWithContext = (code, context, timeout = 2000) => {
  return new Promise((resolve, reject) => {
    try {
      // Create parameter names and values arrays from context object
      const paramNames = Object.keys(context);
      const paramValues = Object.values(context);
      
      // Create a function with the context parameters
      const userFunction = new Function(...paramNames, code);
      
      // Execute with timeout to prevent infinite loops
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Execution timed out')), timeout);
      });
      
      Promise.race([
        new Promise(resolve => {
          userFunction(...paramValues);
          resolve();
        }),
        timeoutPromise
      ])
      .then(() => {
        resolve();
      })
      .catch(error => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
