import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class VoxelGrid {
    constructor(size = 10) {
        this.size = size;
        this.grid = Array(size).fill().map(() =>
            Array(size).fill().map(() =>
                Array(size).fill(0)
            )
        );
    }

    setVoxel(x, y, z) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size && z >= 0 && z < this.size) {
            this.grid[x][y][z] = 1;
        }
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

class CubeRenderer {
    constructor(container, size = 10) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        this.container = container;
        this.size = size;
        this.setupRenderer();
        this.setupScene();

        // Initialize controls after adding renderer to DOM
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
    }

    setupRenderer() {
        // Set initial size
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Update camera aspect ratio
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
    }

    setupScene() {
        // Position camera
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        this.scene.add(directionalLight);

        // Add a second directional light from another angle
        const secondLight = new THREE.DirectionalLight(0xffffff, 0.5);
        secondLight.position.set(-5, -10, -7);
        this.scene.add(secondLight);

        // Set background
        this.scene.background = new THREE.Color(0x2d2d2d);

        // Add grid helper for reference
        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(gridHelper);
    }

    renderVoxels(voxels) {
        // Clear existing meshes but keep lights and helpers
        while (this.scene.children.length > 0) {
            const object = this.scene.children[0];
            if (object.type === 'Mesh') {
                this.scene.remove(object);
            } else {
                break;
            }
        }

        // Setup scene again to ensure lights and grid are present
        this.setupScene();

        // Create geometry and material for voxels
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4CAF50,
            metalness: 0.3,
            roughness: 0.4
        });

        // Create a group to hold all voxels
        const voxelGroup = new THREE.Group();

        // Add voxels to the group
        for (let x = 0; x < voxels.size; x++) {
            for (let y = 0; y < voxels.size; y++) {
                for (let z = 0; z < voxels.size; z++) {
                    if (voxels.getVoxel(x, y, z)) {
                        const cube = new THREE.Mesh(geometry, material);
                        cube.position.set(x - voxels.size / 2 + 0.5, y - voxels.size / 2 + 0.5, z - voxels.size / 2 + 0.5);
                        voxelGroup.add(cube);
                    }
                }
            }
        }

        // Add the voxel group to the scene
        this.scene.add(voxelGroup);

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    updateRendererSize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Wait for DOM to be fully loaded before initializing renderers
document.addEventListener('DOMContentLoaded', () => {
    // Game state
    window.currentPuzzle = 0;
    window.referenceGrid = new VoxelGrid();
    window.resultGrid = new VoxelGrid();
    window.referenceRenderer = new CubeRenderer(document.getElementById('reference-canvas'));
    window.resultRenderer = new CubeRenderer(document.getElementById('result-canvas'));

    // Add event handlers
    document.getElementById('run-button').addEventListener('click', executeCode);
    document.getElementById('reset-button').addEventListener('click', init);
    document.getElementById('puzzle-select').addEventListener('change', (e) => {
        init();
    });

    // Add window resize handler
    window.addEventListener('resize', () => {
        referenceRenderer.updateRendererSize();
        resultRenderer.updateRendererSize();
    });

    // Initialize game
    init();

    // Start animation loop
    referenceRenderer.animate();
    resultRenderer.animate();
});

// Puzzles
const puzzles = [
    // Basic Cube
    {
        reference: new VoxelGrid(3),
        setup: (grid) => {
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    for (let z = 0; z < 3; z++) {
                        grid.setVoxel(x, y, z);
                    }
                }
            }
        }
    },
    // Hollow Cube
    {
        reference: new VoxelGrid(5),
        setup: (grid) => {
            const size = 5;
            for (let x = 0; x < size; x++) {
                for (let y = 0; y < size; y++) {
                    for (let z = 0; z < size; z++) {
                        if (x === 0 || x === size - 1 ||
                            y === 0 || y === size - 1 ||
                            z === 0 || z === size - 1) {
                            grid.setVoxel(x, y, z);
                        }
                    }
                }
            }
        }
    },
    // Pyramid
    {
        reference: new VoxelGrid(5),
        setup: (grid) => {
            const size = 5;
            for (let layer = 0; layer < size; layer++) {
                const offset = (size - 1 - layer) / 2;
                for (let x = 0; x < layer + 1; x++) {
                    for (let y = 0; y < layer + 1; y++) {
                        grid.setVoxel(x + offset, y + offset, layer);
                    }
                }
            }
        }
    }
];

// Initialize game
function init() {
    window.currentPuzzle = parseInt(document.getElementById('puzzle-select').value);
    puzzles[window.currentPuzzle].setup(window.referenceGrid);
    window.referenceRenderer.renderVoxels(window.referenceGrid);
    window.resultGrid.clear();
    window.resultRenderer.renderVoxels(window.resultGrid);

    // Update puzzle description
    const puzzleSelect = document.getElementById('puzzle-select');
    const selectedOption = puzzleSelect.options[puzzleSelect.selectedIndex];
    document.getElementById('puzzle-description').textContent = selectedOption.text;
}

// Code execution
function executeCode() {
    try {
        // Get user code
        const code = document.getElementById('code-editor').value;

        // Clear previous result
        window.resultGrid.clear();

        // Execute user code
        const userFunction = new Function('setVoxel', code);
        userFunction(window.resultGrid.setVoxel.bind(window.resultGrid));

        // Render result
        window.resultRenderer.renderVoxels(window.resultGrid);

        // Check solution
        checkSolution();
    } catch (error) {
        alert('Error executing code: ' + error.message);
    }
}

// Check if solution is correct
function checkSolution() {
    const reference = puzzles[window.currentPuzzle].reference;
    const result = window.resultGrid;

    // Check if both grids have the same dimensions
    if (reference.size !== result.size) {
        alert('Grid size mismatch! Your model must be the same size as the reference.');
        return false;
    }

    // Compare voxel counts
    const referenceCount = reference.getVoxelCount();
    const resultCount = result.getVoxelCount();

    if (referenceCount !== resultCount) {
        alert(`Voxel count mismatch! Your model has ${resultCount} voxels, but should have ${referenceCount}.`);
        return false;
    }

    // Compare grid contents
    for (let x = 0; x < reference.size; x++) {
        for (let y = 0; y < reference.size; y++) {
            for (let z = 0; z < reference.size; z++) {
                if (reference.getVoxel(x, y, z) !== result.getVoxel(x, y, z)) {
                    alert('Your model does not match the reference! Try again.');
                    return false;
                }
            }
        }
    }

    // If we get here, the solution is correct
    alert('Congratulations! You solved the puzzle!');
    return true;
}
