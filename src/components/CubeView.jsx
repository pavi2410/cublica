import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Voxel component for individual blocks
function Voxel({ position, color, type }) {
  // Create a ref for the mesh
  const meshRef = useRef();
  
  // Material properties based on type
  const materialProps = useMemo(() => {
    const baseProps = {
      metalness: 0.4,
      roughness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      reflectivity: 0.5,
    };
    
    // Different emissive colors based on type
    switch(type) {
      case 1: // Pink
        return { ...baseProps, color: '#ff69b4', emissive: '#330033', emissiveIntensity: 0.2 };
      case 2: // Dark Blue
        return { ...baseProps, color: '#4169e1', emissive: '#000033', emissiveIntensity: 0.2 };
      case 3: // Light Blue
        return { ...baseProps, color: '#00bfff', emissive: '#003344', emissiveIntensity: 0.2 };
      case 4: // White
        return { ...baseProps, color: '#ffffff', emissive: '#222222', emissiveIntensity: 0.1, metalness: 0.2, roughness: 0.1 };
      case 5: // Red
        return { ...baseProps, color: '#ff3333', emissive: '#330000', emissiveIntensity: 0.2 };
      case 6: // Orange
        return { ...baseProps, color: '#ff9933', emissive: '#331100', emissiveIntensity: 0.2 };
      case 7: // Yellow
        return { ...baseProps, color: '#ffff33', emissive: '#333300', emissiveIntensity: 0.2 };
      case 8: // Green
        return { ...baseProps, color: '#33ff33', emissive: '#003300', emissiveIntensity: 0.2 };
      case 9: // Purple
        return { ...baseProps, color: '#9933ff', emissive: '#110033', emissiveIntensity: 0.2 };
      default:
        return { ...baseProps, color: color || '#ff69b4', emissive: '#330033', emissiveIntensity: 0.2 };
    }
  }, [color, type]);
  
  // Add subtle animation
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating effect
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0] * 0.5 + position[2] * 0.5) * 0.02;
      
      // Very subtle rotation
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.01;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 + position[2]) * 0.01;
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[0.95, 0.95, 0.95, 2, 2, 2]} /> {/* More segments for rounded look */}
      <meshPhysicalMaterial {...materialProps} />
    </mesh>
  );
}

// Grid component to render the coordinate system grid
function CoordinateGrid() {
  return (
    <>
      {/* White wireframe cube for grid boundary */}
      <mesh>
        <boxGeometry args={[9, 9, 9]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.8} />
      </mesh>
      
      {/* Coordinate axes */}
      <group>
        {/* X-axis (red) */}
        <mesh position={[2.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 5]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        <mesh position={[5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        <Text position={[5.5, 0, 0]} color="#ff0000" fontSize={0.5}>
          X
        </Text>
        
        {/* Y-axis (green) */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 5]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        <mesh position={[0, 5, 0]}>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        <Text position={[0, 5.5, 0]} color="#00ff00" fontSize={0.5}>
          Y
        </Text>
        
        {/* Z-axis (blue) */}
        <mesh position={[0, 0, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 5]} />
          <meshBasicMaterial color="#0088ff" />
        </mesh>
        <mesh position={[0, 0, 5]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <meshBasicMaterial color="#0088ff" />
        </mesh>
        <Text position={[0, 0, 5.5]} color="#0088ff" fontSize={0.5}>
          Z
        </Text>
      </group>
      
      {/* Coordinate markers */}
      {[-4, -3, -2, -1, 1, 2, 3, 4].map((i) => (
        <group key={`markers-${i}`}>
          {/* X-axis markers */}
          <Sphere position={[i, 0, 0]} args={[0.08, 8, 8]}>
            <meshBasicMaterial color="#ff0000" />
          </Sphere>
          <Text position={[i, -0.3, 0]} color="#ff0000" fontSize={0.3} anchorY="top">
            {i}
          </Text>
          
          {/* Y-axis markers */}
          <Sphere position={[0, i, 0]} args={[0.08, 8, 8]}>
            <meshBasicMaterial color="#00ff00" />
          </Sphere>
          <Text position={[-0.3, i, 0]} color="#00ff00" fontSize={0.3} anchorX="right">
            {i}
          </Text>
          
          {/* Z-axis markers */}
          <Sphere position={[0, 0, i]} args={[0.08, 8, 8]}>
            <meshBasicMaterial color="#0088ff" />
          </Sphere>
          <Text position={[0, -0.3, i]} color="#0088ff" fontSize={0.3} anchorY="top">
            {i}
          </Text>
        </group>
      ))}
    </>
  );
}

// Scene component that renders the grid and voxels
function Scene({ grid, viewMode }) {
  const { camera } = useThree();
  
  // Set camera position based on view mode
  useEffect(() => {
    if (!camera) return;
    
    switch(viewMode) {
      case 'top':
        camera.position.set(0, 15, 0);
        break;
      case 'front':
        camera.position.set(0, 0, 15);
        break;
      case 'side':
        camera.position.set(15, 0, 0);
        break;
      default: // 3d view
        camera.position.set(10, 10, 10);
        break;
    }
    
    camera.lookAt(0, 0, 0);
  }, [camera, viewMode]);
  
  // Create voxels from grid data
  const voxels = useMemo(() => {
    if (!grid || !grid.grid) return [];
    
    const voxelArray = [];
    const gridOffset = Math.floor(grid.size / 2);
    
    for (let x = 0; x < grid.size; x++) {
      for (let y = 0; y < grid.size; y++) {
        for (let z = 0; z < grid.size; z++) {
          const voxelType = grid.getVoxel(x, y, z);
          if (voxelType === 0) continue;
          
          // Transform coordinates to match the coordinate system (-4 to +4)
          const xPos = x - gridOffset;
          const yPos = y - gridOffset;
          const zPos = z - gridOffset;
          
          voxelArray.push({
            key: `voxel-${x}-${y}-${z}`,
            position: [xPos, yPos, zPos],
            type: voxelType
          });
        }
      }
    }
    
    return voxelArray;
  }, [grid]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 7]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
        shadow-bias={-0.001}
      />
      <directionalLight position={[-5, -10, -7]} intensity={0.7} />
      <hemisphereLight args={["#ffffff", "#444444", 0.6]} />
      <pointLight position={[3, 3, 3]} intensity={0.8} distance={15} />
      <pointLight position={[-3, 6, -3]} intensity={0.6} distance={15} />
      
      {/* Environment and shadows */}
      <Environment preset="city" />
      <ContactShadows 
        position={[0, -4.5, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={1.5} 
        far={4.5} 
      />
      
      {/* Coordinate system */}
      <CoordinateGrid />
      
      {/* Voxels */}
      {voxels.map((voxel) => (
        <Voxel 
          key={voxel.key} 
          position={voxel.position} 
          type={voxel.type} 
        />
      ))}
    </>
  );
}

// Main CubeView component
function CubeView({ title, grid, id, className }) {
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'top', 'front', 'side'

  // View mode buttons
  const viewButtons = [
    { mode: '3d', label: '3D' },
    { mode: 'top', label: 'Top' },
    { mode: 'front', label: 'Front' },
    { mode: 'side', label: 'Side' }
  ];
  
  return (
    <div className={`cube-view ${className || ''}`}>
      <div className="cube-view-header">
        <h3>{title}</h3>
        <div className="view-buttons">
          {viewButtons.map(button => (
            <button 
              key={button.mode}
              className={viewMode === button.mode ? 'active' : ''}
              onClick={() => setViewMode(button.mode)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="cube-view-canvas" style={{ width: '100%', height: 'calc(100% - 40px)' }}>
        <Canvas
          shadows
          camera={{ position: [10, 10, 10], fov: 75, near: 0.1, far: 1000 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance',
            physicallyCorrectLights: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0
          }}
          style={{ background: '#001020' }}
        >
          <Scene grid={grid} viewMode={viewMode} />
          <OrbitControls 
            enableDamping 
            dampingFactor={0.25} 
            rotateSpeed={0.7}
          />
        </Canvas>
      </div>
      
      {/* Voxel count indicator */}
      <div className="voxel-count">
        Voxels: {grid ? grid.getVoxelCount() : 0}
      </div>
    </div>
  );
}

export default CubeView;
