import { useState, useEffect } from 'react';
import CubeView from './components/CubeView';
import CodeEditor from './components/CodeEditor';
import Header from './components/Header';
import Footer from './components/Footer';
import MessageDisplay from './components/MessageDisplay';
import { puzzles } from './data/puzzles';
import VoxelGrid from './utils/VoxelGrid';

function App() {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [referenceGrid, setReferenceGrid] = useState(new VoxelGrid());
  const [resultGrid, setResultGrid] = useState(new VoxelGrid());
  const [code, setCode] = useState(`// This function runs for every (x,y,z) coordinate in the grid
// Return a color value (1-9) to place a voxel with that color
// Return 0 or null for no voxel at that position

// Initialize color to 0 (no voxel)
c = 0

// Case 1: Bottom platform (pink)
if (y === -4) {
  c = 1  // Pink
}

// Case 2: Walls (blue)
if (abs(x) === 3 || abs(z) === 3) {
  if (y >= -3 && y <= 3) {
    c = 2  // Blue
  }
}

// Case 3: Special features (white)
if (y === -3 && abs(x) < 2 && abs(z) < 2) {
  c = 4  // White
}

// Case 4: Keyboard-like pattern (yellow)
if (y === -3 && abs(x) < 4 && z >= 0 && z < 4) {
  c = 7  // Yellow
}

return c`); 
  
  // UI state
  const [activeCodeTab, setActiveCodeTab] = useState('code');
  const [activeViewTab, setActiveViewTab] = useState('reference');
  const [isSolved, setIsSolved] = useState(false);
  const [message, setMessage] = useState(null);

  // Initialize puzzle
  useEffect(() => {
    const newReferenceGrid = new VoxelGrid(puzzles[currentPuzzle].size);
    puzzles[currentPuzzle].setup(newReferenceGrid);
    setReferenceGrid(newReferenceGrid);
    
    // Reset result grid
    setResultGrid(new VoxelGrid(puzzles[currentPuzzle].size));
  }, [currentPuzzle]);

  const handlePuzzleChange = (puzzleIndex) => {
    setCurrentPuzzle(parseInt(puzzleIndex));
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const executeCode = () => {
    try {
      // Create a new grid for the result
      const newResultGrid = new VoxelGrid(puzzles[currentPuzzle].size);
      
      // Get the setVoxel function bound to the new grid
      const setVoxelFunction = newResultGrid.setVoxel.bind(newResultGrid);
      
      // Import the code interpreter function from our utility
      import('./utils/CodeInterpreter.js')
        .then(({ executeCode }) => {
          // Execute code that takes x,y,z coordinates and returns a color value
          return executeCode(code, puzzles[currentPuzzle].size, setVoxelFunction, 5000);
        })
        .then(() => {
          // Update result grid
          setResultGrid(newResultGrid);
          
          // Check solution using the existing function
          checkSolution(newResultGrid);
        })
        .catch(error => {
          console.error('Code execution error:', error);
          setMessage({ type: 'error', text: `Error: ${error.message}` });
        });
    } catch (error) {
      console.error('Code execution error:', error);
      setMessage({ type: 'error', text: `Error: ${error.message}` });
    }
  };

  const resetCode = () => {
    setResultGrid(new VoxelGrid(puzzles[currentPuzzle].size));
  };

  const checkSolution = (result) => {
    const reference = referenceGrid;
    
    // Check if both grids have the same dimensions
    if (reference.size !== result.size) {
      setMessage({ type: 'error', text: 'Grid size mismatch! Your model must be the same size as the reference.' });
      setIsSolved(false);
      return false;
    }
    
    // Compare voxel counts
    const referenceCount = reference.getVoxelCount();
    const resultCount = result.getVoxelCount();
    
    if (referenceCount !== resultCount) {
      setMessage({ type: 'error', text: `Voxel count mismatch! Your model has ${resultCount} voxels, but should have ${referenceCount}.` });
      setIsSolved(false);
      return false;
    }
    
    // Compare grid contents
    for (let x = 0; x < reference.size; x++) {
      for (let y = 0; y < reference.size; y++) {
        for (let z = 0; z < reference.size; z++) {
          const refVoxel = reference.getVoxel(x, y, z);
          const resultVoxel = result.getVoxel(x, y, z);
          
          if (refVoxel !== resultVoxel) {
            setMessage({ type: 'error', text: 'Your model does not match the reference. Check the positions of your voxels.' });
            setIsSolved(false);
            return false;
          }
        }
      }
    }
    
    setMessage({ type: 'success', text: 'Puzzle solved! ' });
    setIsSolved(true);
    return true;
  };

  return (
    <div className="cublica-container">
      <Header title="Cublica Actions" />
      
      {/* Message display for success/error notifications */}
      <MessageDisplay message={message} />
      
      <div className="cublica-content">
        {/* Code Panel (Left Side) */}
        <div className="code-panel">
          <div className="code-tabs">
            <div 
              className={`code-tab ${activeCodeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveCodeTab('code')}
            >
              Code
            </div>
            <div 
              className={`code-tab ${activeCodeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveCodeTab('settings')}
            >
              Settings
            </div>
            <div className="code-tab-placeholder">Puzzle {currentPuzzle + 1}: {puzzles[currentPuzzle].title}</div>
          </div>
          
          {activeCodeTab === 'code' && (
            <CodeEditor 
              code={code} 
              onChange={handleCodeChange}
              onRun={executeCode}
            />
          )}
          
          {activeCodeTab === 'settings' && (
            <div className="settings-panel">
              <h3>Puzzle Selection</h3>
              <select 
                value={currentPuzzle} 
                onChange={(e) => handlePuzzleChange(e.target.value)}
                className="puzzle-selector"
              >
                {puzzles.map((puzzle, index) => (
                  <option key={index} value={index}>
                    Puzzle {index + 1}: {puzzle.title}
                  </option>
                ))}
              </select>
              
              <div className="puzzle-description">
                <h4>{puzzles[currentPuzzle].title}</h4>
                <p>{puzzles[currentPuzzle].description}</p>
              </div>
              
              <div className="action-buttons">
                <button onClick={executeCode} className="execute-button">Run Code</button>
                <button onClick={resetCode} className="reset-button">Reset</button>
              </div>
            </div>
          )}
        </div>
        
        {/* View Panel (Right Side) */}
        <div className="view-panel">
          {/* Top section with tabs for Reference Model and Documentation */}
          <div className="view-top-section">
            <div className="view-tabs">
              <div 
                className={`view-tab ${activeViewTab === 'reference' ? 'active' : ''}`}
                onClick={() => setActiveViewTab('reference')}
              >
                Reference Object
              </div>
              <div 
                className={`view-tab ${activeViewTab === 'docs' ? 'active' : ''}`}
                onClick={() => setActiveViewTab('docs')}
              >
                Documentation
              </div>
              <div className="view-nav">
                <button 
                  className="view-nav-prev" 
                  onClick={() => setCurrentPuzzle(prev => Math.max(0, prev - 1))}
                >
                  ◀
                </button>
                <button 
                  className="view-nav-next"
                  onClick={() => setCurrentPuzzle(prev => Math.min(puzzles.length - 1, prev + 1))}
                >
                  ▶
                </button>
              </div>
            </div>
            
            {/* Content for top section based on active tab */}
            <div className="view-top-content">
              {activeViewTab === 'reference' && (
                <CubeView 
                  title="" 
                  grid={referenceGrid} 
                  id="reference-canvas" 
                  className="cube-view-top"
                />
              )}
              
              {activeViewTab === 'docs' && (
                <div className="docs-container-top">
                  <h2>Cublica Documentation</h2>
                  
                  <h3>Coordinate-Based Voxel Creation</h3>
                  <p>
                    Your code is a function that takes x, y, z coordinates and returns a color value (1-9).
                    This function is called for every coordinate in the grid.
                    Return 0 or null for no voxel at that position.
                  </p>
                  
                  <h3>Coordinate System</h3>
                  <p>
                    The grid uses a 3D coordinate system where (0,0,0) is the center.
                    Coordinates range from -4 to +4 in each dimension for a 9x9x9 grid.
                  </p>
                  
                  <h3>Available Functions</h3>
                  <ul>
                    <li><code>abs(x)</code> - Returns the absolute value of x</li>
                  </ul>
                  
                  <h3>Color Values</h3>
                  <ul className="color-list">
                    <li><span className="color-swatch" style={{background: 'oklch(0.84 0.18 330)'}}></span> 1: Pink</li>
                    <li><span className="color-swatch" style={{background: 'oklch(0.6 0.2 250)'}}></span> 2: Dark Blue</li>
                    <li><span className="color-swatch" style={{background: 'oklch(0.8 0.15 220)'}}></span> 3: Light Blue</li>
                    <li><span className="color-swatch" style={{background: 'oklch(0.95 0.02 0)'}}></span> 4: White</li>
                    <li><span className="color-swatch" style={{background: 'oklch(0.7 0.25 25)'}}></span> 5: Red</li>
                    <li><span className="color-swatch" style={{background: 'oklch(0.8 0.15 60)'}}></span> 6: Orange</li>
                    <li><span className="color-swatch" style={{background: 'oklch(0.9 0.15 90)'}}></span> 7: Yellow</li>
                    <li><span className="color-swatch" style={{background: 'oklch(0.8 0.15 140)'}}></span> 8: Green</li>
                    <li><span className="color-swatch" style={{background: 'oklch(0.7 0.2 290)'}}></span> 9: Purple</li>
                  </ul>
                  
                  <h3>Example Code</h3>
                  <pre className="docs-code">
{`// Initialize color to 0 (no voxel)
c = 0

// Bottom platform (pink)
if (y === -4) {
  c = 1
}

// Walls (blue)
if (abs(x) === 3 || abs(z) === 3) {
  if (y >= -3 && y <= 3) {
    c = 2
  }
}

// Special features (white)
if (y === -3 && abs(x) < 2 && abs(z) < 2) {
  c = 4
}

// Keyboard-like pattern (yellow)
if (y === -3 && abs(x) < 4 && z >= 0 && z < 4) {
  c = 7
}

return c`}
                  </pre>
                  
                  <h3>Advanced Techniques</h3>
                  <p>You can use mathematical formulas to create interesting shapes:</p>
                  
                  <pre className="docs-code">
{`// Create a sphere
const radius = 3
const distance = Math.sqrt(x*x + y*y + z*z)

if (distance <= radius) {
  // Color based on distance from center
  c = Math.floor(distance) + 1
}

return c`}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom section always showing Your Model */}
          <div className="view-bottom-section">
            <div className="view-section-header">Your Model</div>
            <div className="view-bottom-content">
              <CubeView 
                title="" 
                grid={resultGrid} 
                id="result-canvas" 
                className="cube-view-bottom"
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
