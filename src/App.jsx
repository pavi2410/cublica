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
  const [code, setCode] = useState(`// Set voxels in the grid using setVoxel(x, y, z)
// Example: Create a cube at position 0,0,0
setVoxel(0, 0, 0);

// Loop through coordinates to create patterns
for (let x = 0; x < 3; x++) {
  for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
      // Only set corner voxels for a hollow cube
      if (x === 0 || x === 2 || y === 0 || y === 2 || z === 0 || z === 2) {
        setVoxel(x, y, z);
      }
    }
  }
}`); 
  
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
      
      // Import the executeUserCode function from our utility
      import('./utils/CodeInterpreter.js')
        .then(({ executeUserCode }) => {
          // Execute the user code with our utility function
          return executeUserCode(code, setVoxelFunction, 2000);
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
    <div className="replicube-container">
      <Header title="RepliCUBE Actions" />
      
      {/* Message display for success/error notifications */}
      <MessageDisplay message={message} />
      
      <div className="replicube-content">
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
                  <h2>RepliCUBE Documentation</h2>
                  
                  <h3>Available Functions</h3>
                  <pre className="docs-code">
                    setVoxel(x, y, z) - Place a voxel at the specified coordinates
                  </pre>
                  
                  <h3>Coordinate System</h3>
                  <p>
                    The grid uses a 3D coordinate system where (0,0,0) is the corner.
                    The grid size depends on the puzzle, but coordinates are always non-negative integers.
                  </p>
                  
                  <h3>Example Code</h3>
                  <pre className="docs-code">
{`// Create a 3x3x3 cube
for (let x = 0; x < 3; x++) {
  for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
      setVoxel(x, y, z);
    }
  }
}`}
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
