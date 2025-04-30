import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

function CubeView({ title, grid, id, className }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'top', 'front', 'side'

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2d3748); // Dark blue background for better contrast
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(12, 12, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    // Add lights - improved lighting setup for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const secondLight = new THREE.DirectionalLight(0xffffff, 0.7);
    secondLight.position.set(-5, -10, -7);
    scene.add(secondLight);
    
    // Add a hemisphere light for better overall illumination
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemisphereLight);
    
    // Create grid boundary (white wireframe cube)
    const gridSize = 9; // -4 to +4 coordinate system
    const gridGeometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const gridCube = new THREE.Mesh(gridGeometry, gridMaterial);
    scene.add(gridCube);
    
    // Create colored axis arrows
    const createAxisArrow = (direction, color) => {
      const length = 5;
      const headLength = 0.5;
      const headWidth = 0.3;
      const origin = new THREE.Vector3(0, 0, 0);
      const dir = new THREE.Vector3(...direction).normalize();
      const arrowHelper = new THREE.ArrowHelper(dir, origin, length, color, headLength, headWidth);
      return arrowHelper;
    };
    
    // X-axis (red)
    const xAxis = createAxisArrow([1, 0, 0], 0xff0000);
    scene.add(xAxis);
    
    // Y-axis (green)
    const yAxis = createAxisArrow([0, 1, 0], 0x00ff00);
    scene.add(yAxis);
    
    // Z-axis (blue)
    const zAxis = createAxisArrow([0, 0, 1], 0x0088ff);
    scene.add(zAxis);
    
    // Add coordinate markers
    const addCoordinateMarkers = () => {
      // Create points along each axis
      const pointGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      
      // Create grid lines
      for (let i = -4; i <= 4; i++) {
        // X-axis markers (red)
        const xMarker = new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        xMarker.position.set(i, 0, 0);
        scene.add(xMarker);
        
        // Y-axis markers (green)
        const yMarker = new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        yMarker.position.set(0, i, 0);
        scene.add(yMarker);
        
        // Z-axis markers (blue)
        const zMarker = new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial({ color: 0x0088ff }));
        zMarker.position.set(0, 0, i);
        scene.add(zMarker);
      }
    };
    
    addCoordinateMarkers();

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
      
      // Force render after resize
      if (sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      scene.clear();
    };
  }, []);

  // Update scene when grid changes
  useEffect(() => {
    if (!sceneRef.current || !grid) return;

    const scene = sceneRef.current;
    
    // Remove existing voxels but keep lights, axes, and grid
    scene.children = scene.children.filter(
      child => child.type === 'AmbientLight' || 
               child.type === 'DirectionalLight' || 
               child.type === 'ArrowHelper' || 
               child.type === 'Mesh' && child.geometry.type === 'BoxGeometry' && child.material.wireframe
    );

    // Create geometry and material for voxels
    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95); // Slightly smaller to see edges better
    
    // Create materials with different colors matching the image - with enhanced visibility
    const materials = {
      // Pink/magenta for outer shell (type 1) - brighter for better visibility
      pink: new THREE.MeshStandardMaterial({ 
        color: 0xff69b4, 
        emissive: 0x330033,
        metalness: 0.2, 
        roughness: 0.5 
      }),
      // Dark blue/purple for internal pattern (type 2) - more saturated
      darkBlue: new THREE.MeshStandardMaterial({ 
        color: 0x4169e1, 
        emissive: 0x000033,
        metalness: 0.3, 
        roughness: 0.4 
      }),
      // Light blue for bottom layer (type 3) - brighter
      lightBlue: new THREE.MeshStandardMaterial({ 
        color: 0x00bfff, 
        emissive: 0x003344,
        metalness: 0.2, 
        roughness: 0.3 
      }),
      // White for special blocks (type 4) - pure white with slight shine
      white: new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0x222222,
        metalness: 0.1, 
        roughness: 0.2 
      })
    };
    
    // Create a group to hold all voxels
    const voxelGroup = new THREE.Group();
    
    // Add coordinate system transformation to match the image
    // In the image, (0,0,0) appears to be at the center, with coordinates from -4 to +4
    const gridOffset = 4; // Half of the 9x9x9 grid
    
    // Add voxels based on grid data
    if (grid && grid.grid) {
      for (let x = 0; x < grid.size; x++) {
        for (let y = 0; y < grid.size; y++) {
          for (let z = 0; z < grid.size; z++) {
            const voxelType = grid.getVoxel(x, y, z);
            if (voxelType === 0) continue;
            
            // Transform coordinates to match the image's coordinate system
            const xPos = x - gridOffset;
            const yPos = y - gridOffset;
            const zPos = z - gridOffset;
            
            // Choose material based on voxel type
            let material;
            
            switch(voxelType) {
              case 1: // Pink/Magenta (border)
                material = materials.pink;
                break;
              case 2: // Dark Blue (internal structure)
                material = materials.darkBlue;
                break;
              case 3: // Light Blue (bottom layer)
                material = materials.lightBlue;
                break;
              case 4: // White (special blocks)
                material = materials.white;
                break;
              default:
                material = materials.pink; // Default to pink
            }
            
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(xPos, yPos, zPos);
            voxelGroup.add(cube);
          }
        }
      }
    }

    // Add the voxel group to the scene
    scene.add(voxelGroup);
    
    // Add coordinate number labels
    const addCoordinateLabels = () => {
      // Add coordinate numbers along axes
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue; // Skip zero position
        
        // Create text for coordinate numbers
        const createCoordinateText = (position, color, value) => {
          const textDiv = document.createElement('div');
          textDiv.className = 'coordinate-label';
          textDiv.textContent = value;
          textDiv.style.color = color;
          textDiv.style.position = 'absolute';
          textDiv.style.fontSize = '10px';
          textDiv.style.fontWeight = 'bold';
          textDiv.style.pointerEvents = 'none';
          
          containerRef.current.appendChild(textDiv);
          
          // Update position in animation loop
          const updatePosition = () => {
            if (!cameraRef.current || !rendererRef.current) return;
            
            const vector = new THREE.Vector3(...position);
            vector.project(cameraRef.current);
            
            const x = (vector.x * 0.5 + 0.5) * containerRef.current.clientWidth;
            const y = (-vector.y * 0.5 + 0.5) * containerRef.current.clientHeight;
            
            textDiv.style.left = `${x}px`;
            textDiv.style.top = `${y}px`;
          };
          
          return updatePosition;
        };
        
        // X-axis labels (red)
        const xLabelPos = [i, -0.3, 0];
        const xLabelUpdate = createCoordinateText(xLabelPos, '#ff0000', i);
        
        // Y-axis labels (green)
        const yLabelPos = [-0.3, i, 0];
        const yLabelUpdate = createCoordinateText(yLabelPos, '#00ff00', i);
        
        // Z-axis labels (blue)
        const zLabelPos = [0, -0.3, i];
        const zLabelUpdate = createCoordinateText(zLabelPos, '#0088ff', i);
        
        // Store update functions to call in animation loop
        const labelUpdates = [xLabelUpdate, yLabelUpdate, zLabelUpdate];
        labelUpdates.forEach(update => {
          const existingAnimate = animationFrameRef.current;
          animationFrameRef.current = () => {
            existingAnimate && existingAnimate();
            update();
          };
        });
      }
    };
    
    // Clean up existing labels before adding new ones
    const existingLabels = containerRef.current.querySelectorAll('.coordinate-label');
    existingLabels.forEach(label => label.remove());
    
    addCoordinateLabels();

    // Render the scene
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(scene, cameraRef.current);
    }
  }, [grid]);

  // Function to handle camera view changes
  const changeView = (mode) => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    // Reset controls
    controls.reset();
    
    switch(mode) {
      case 'top':
        camera.position.set(0, 15, 0);
        break;
      case 'front':
        camera.position.set(0, 0, 15);
        break;
      case 'side':
        camera.position.set(15, 0, 0);
        break;
      default: // 3d view - match the isometric view in the image
        camera.position.set(10, 10, 10);
        break;
    }
    
    camera.lookAt(0, 0, 0);
    setViewMode(mode);
  };
  
  // Function to handle zoom
  const handleZoom = (direction) => {
    if (!cameraRef.current) return;
    
    const camera = cameraRef.current;
    const zoomFactor = direction === 'in' ? 0.8 : 1.2;
    
    // For perspective camera, adjust position to zoom
    const currentDistance = camera.position.length();
    const newDistance = Math.max(5, Math.min(20, currentDistance * zoomFactor));
    
    camera.position.normalize().multiplyScalar(newDistance);
    camera.lookAt(0, 0, 0);
  };
  
  // Reset camera and controls
  const resetView = () => {
    if (!controlsRef.current || !cameraRef.current) return;
    
    controlsRef.current.reset();
    cameraRef.current.position.set(12, 12, 12);
    cameraRef.current.lookAt(0, 0, 0);
    setViewMode('3d');
  };

  // Force re-render when className changes (important for layout changes)
  useEffect(() => {
    if (containerRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
      // Small delay to ensure the container has been properly laid out
      setTimeout(() => {
        handleResize();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }, 100);
    }
  }, [className]);

  return (
    <div className={`cube-view ${className || ''}`}>
      <div className="cube-title">{title}</div>
      <div ref={containerRef} className="cube-canvas" id={id}>
        {/* Coordinate axes labels */}
        <div className="axis-label x-axis">X</div>
        <div className="axis-label y-axis">Y</div>
        <div className="axis-label z-axis">Z</div>
        
        {/* View controls */}
        <div className="view-controls">
          <button className="view-control zoom-in" onClick={() => handleZoom('in')}>+</button>
          <button className="view-control zoom-out" onClick={() => handleZoom('out')}>-</button>
          <button className="view-control reset" onClick={resetView}>⟲</button>
        </div>
        
        {/* View mode controls */}
        <div className="view-mode-controls">
          <button 
            className={`view-mode-button ${viewMode === '3d' ? 'active' : ''}`}
            onClick={() => changeView('3d')}
          >
            3D
          </button>
          <button 
            className={`view-mode-button ${viewMode === 'top' ? 'active' : ''}`}
            onClick={() => changeView('top')}
          >
            Top
          </button>
          <button 
            className={`view-mode-button ${viewMode === 'front' ? 'active' : ''}`}
            onClick={() => changeView('front')}
          >
            Front
          </button>
          <button 
            className={`view-mode-button ${viewMode === 'side' ? 'active' : ''}`}
            onClick={() => changeView('side')}
          >
            Side
          </button>
        </div>
        
        {/* Voxel count indicator */}
        <div className="voxel-count">
          Voxels: {grid ? grid.getVoxelCount() : 0}
        </div>
      </div>
    </div>
  );
}

export default CubeView;
