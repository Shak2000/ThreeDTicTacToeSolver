// 3D UI using three.js
let width3d = 3, height3d = 3, depth3d = 3, winLength3d = 3, aiDepth3d = 2;
let gameInProgress3d = false;
let aiThinking3d = false;
let boardState3d = null;
let currentPlayer3d = 'X';

const board3dContainer = document.getElementById('board3dContainer');
const status3dDiv = document.getElementById('status3d');
const startBtn3d = document.getElementById('startBtn3d');
const restartBtn3d = document.getElementById('restartBtn3d');
const undoBtn3d = document.getElementById('undoBtn3d');
const aiBtn3d = document.getElementById('aiBtn3d');
const quitBtn3d = document.getElementById('quitBtn3d');

// Three.js scene setup
let scene, camera, renderer, controls, raycaster, mouse;
let cellMeshes = [];
let rotationIconRenderer, rotationIconScene, rotationIconCamera, rotationIconMesh;
let isRotatingBoard = false;
let lastPointer = {x: 0, y: 0};

function getSettings3d() {
    width3d = parseInt(document.getElementById('width3d').value);
    height3d = parseInt(document.getElementById('height3d').value);
    depth3d = parseInt(document.getElementById('depth3d').value);
    winLength3d = parseInt(document.getElementById('winLength3d').value);
    aiDepth3d = parseInt(document.getElementById('aiDepth3d').value);
}

function setAIThinking3d(thinking) {
    aiThinking3d = thinking;
    document.querySelectorAll('button, input').forEach(el => {
        if (el.id !== 'aiDepth3d') el.disabled = thinking;
    });
    if (thinking) {
        status3dDiv.textContent = 'Computer is thinking ...';
    }
}

function updateControls3d() {
    document.getElementById('preGameControls3d').style.display = gameInProgress3d ? 'none' : '';
    document.getElementById('inGameControls3d').style.display = gameInProgress3d ? '' : 'none';
    if (!gameInProgress3d) {
        status3dDiv.textContent = '';
    }
}

async function checkGameInProgress3d() {
    const res = await fetch('/get_valid_moves');
    const validMoves = await res.json();
    gameInProgress3d = validMoves.length > 0;
    updateControls3d();
}

async function startGame3d() {
    getSettings3d();
    await fetch(`/start?height=${height3d}&width=${width3d}&depth=${depth3d}&win_length=${winLength3d}`, { method: 'POST' });
    await updateBoardState3d();
    status3dDiv.textContent = `Game started! Player X's turn.`;
    gameInProgress3d = true;
    updateControls3d();
    setupThreeScene();
    renderBoard3d();
}

async function restartGame3d() {
    await startGame3d();
}

async function undoMove3d() {
    await fetch('/undo', { method: 'POST' });
    await updateBoardState3d();
    await updateStatus3d();
    renderBoard3d();
}

async function aiMove3d() {
    getSettings3d();
    setAIThinking3d(true);
    await fetch(`/search_depth?search_depth=${aiDepth3d}`, { method: 'POST' });
    await updateBoardState3d();
    await updateStatus3d();
    renderBoard3d();
    setAIThinking3d(false);
}

async function quitGame3d() {
    await fetch('/quit', { method: 'POST' });
    gameInProgress3d = false;
    updateControls3d();
    status3dDiv.textContent = 'Game quit. Start a new game!';
    if (renderer) {
        renderer.clear();
        board3dContainer.innerHTML = '';
    }
}

async function makeMove3d(x, y, z) {
    if (aiThinking3d) return;
    const res = await fetch(`/move?x=${x}&y=${y}&z=${z}`, { method: 'POST' });
    const valid = await res.json();
    if (!valid) {
        status3dDiv.textContent = 'Invalid move!';
        return;
    }
    await fetch('/switch_player', { method: 'POST' });
    await updateBoardState3d();
    await updateStatus3d();
    renderBoard3d();
}

async function updateBoardState3d() {
    const res = await fetch('/get_board');
    const data = await res.json();
    boardState3d = data.board;
    currentPlayer3d = data.player;
}

async function updateStatus3d() {
    if (!gameInProgress3d) {
        status3dDiv.textContent = '';
        return;
    }
    const winnerRes = await fetch('/check_winner');
    const winner = await winnerRes.json();
    if (winner) {
        status3dDiv.textContent = `Player ${winner} wins!`;
        return;
    }
    const drawRes = await fetch('/is_draw');
    const isDraw = await drawRes.json();
    if (isDraw) {
        status3dDiv.textContent = `It's a draw!`;
        return;
    }
    status3dDiv.textContent = `Player ${currentPlayer3d}'s turn.`;
}

function setupThreeScene() {
    if (renderer) {
        renderer.dispose && renderer.dispose();
        board3dContainer.innerHTML = '';
    }
    scene = new THREE.Scene();
    // Responsive camera
    const w = board3dContainer.clientWidth;
    const h = board3dContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 1000);
    camera.position.set(width3d * 1.5, height3d * 1.5, depth3d * 3.5);
    camera.lookAt(new THREE.Vector3(width3d/2-0.5, height3d/2-0.5, depth3d/2-0.5));
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xf4f4f4);
    renderer.setSize(w, h);
    renderer.domElement.className = 'threejs-canvas';
    board3dContainer.appendChild(renderer.domElement);
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    // Add light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1,2,3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    // Add event listeners
    renderer.domElement.addEventListener('pointerdown', onThreeClick, false);
    renderer.domElement.addEventListener('pointermove', onThreePointerMove, false);
    renderer.domElement.addEventListener('pointerup', onThreePointerUp, false);
    // Add rotation icon overlay
    addRotationIconOverlay();
}

function addRotationIconOverlay() {
    // Remove previous icon overlay if any
    let iconDiv = document.getElementById('rotationIconOverlay');
    if (iconDiv) iconDiv.remove();
    iconDiv = document.createElement('div');
    iconDiv.id = 'rotationIconOverlay';
    iconDiv.className = 'rotation-icon';
    iconDiv.style.position = 'absolute';
    iconDiv.style.right = '32px';
    iconDiv.style.top = '32px';
    iconDiv.style.width = '64px';
    iconDiv.style.height = '64px';
    iconDiv.style.pointerEvents = 'auto';
    board3dContainer.appendChild(iconDiv);
    // Three.js overlay for icon
    rotationIconScene = new THREE.Scene();
    rotationIconCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    rotationIconCamera.position.set(0, 0, 3);
    rotationIconRenderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    rotationIconRenderer.setClearColor(0x000000, 0);
    rotationIconRenderer.setSize(64, 64);
    iconDiv.appendChild(rotationIconRenderer.domElement);
    // Truncated icosahedron
    const geometry = new THREE.IcosahedronGeometry(0.9, 1);
    const material = new THREE.MeshPhongMaterial({color: 0x888888, flatShading: true, shininess: 60});
    rotationIconMesh = new THREE.Mesh(geometry, material);
    rotationIconScene.add(rotationIconMesh);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2,2,3);
    rotationIconScene.add(light);
    rotationIconScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    // Drag events for icon
    iconDiv.addEventListener('pointerdown', onRotationIconPointerDown, false);
    iconDiv.addEventListener('pointerup', onRotationIconPointerUp, false);
    iconDiv.addEventListener('pointermove', onRotationIconPointerMove, false);
    animateRotationIcon();
}

function animateRotationIcon() {
    // Only rotate the icon if the user is dragging it
    if (iconRotating && rotationIconMesh) {
        // The actual rotation is handled in onRotationIconPointerMove
        // so here we just render
    }
    if (rotationIconRenderer && rotationIconScene && rotationIconCamera) {
        rotationIconRenderer.render(rotationIconScene, rotationIconCamera);
    }
    requestAnimationFrame(animateRotationIcon);
}

let iconRotating = false;
let iconLastPointer = {x: 0, y: 0};
function onRotationIconPointerDown(e) {
    iconRotating = true;
    iconLastPointer.x = e.clientX;
    iconLastPointer.y = e.clientY;
    document.body.style.cursor = 'grabbing';
    window.addEventListener('pointerup', onRotationIconPointerUp, true);
    window.addEventListener('pointermove', onRotationIconPointerMove, true);
    e.preventDefault();
    e.stopPropagation();
}
function onRotationIconPointerUp(e) {
    iconRotating = false;
    document.body.style.cursor = '';
    window.removeEventListener('pointerup', onRotationIconPointerUp, true);
    window.removeEventListener('pointermove', onRotationIconPointerMove, true);
    e.preventDefault();
    e.stopPropagation();
}
function onRotationIconPointerMove(e) {
    if (!iconRotating) return;
    const dx = e.clientX - iconLastPointer.x;
    const dy = e.clientY - iconLastPointer.y;
    // Allow full 360-degree rotation
    scene.rotation.y += dx * 0.01;
    scene.rotation.x += dy * 0.01;
    if (rotationIconMesh) {
        rotationIconMesh.rotation.y += dx * 0.01;
        rotationIconMesh.rotation.x += dy * 0.01;
    }
    iconLastPointer.x = e.clientX;
    iconLastPointer.y = e.clientY;
    e.preventDefault();
    e.stopPropagation();
}

function renderBoard3d() {
    if (!scene || !boardState3d) return;
    cellMeshes.forEach(mesh => scene.remove(mesh));
    cellMeshes = [];
    const cellSize = Math.min(1.2, 10/Math.max(width3d, height3d, depth3d));
    const spacing = cellSize; // spacing between centers = diameter
    for (let z = 0; z < depth3d; z++) {
        for (let y = 0; y < height3d; y++) {
            for (let x = 0; x < width3d; x++) {
                const value = boardState3d[z][y][x];
                let mesh;
                if (value === 'X') {
                    // 3D X: two perpendicular boxes
                    const group = new THREE.Group();
                    const mat = new THREE.MeshPhongMaterial({color: 0x1976d2});
                    const box1 = new THREE.Mesh(new THREE.BoxGeometry(cellSize*0.7, cellSize*0.18, cellSize*0.18), mat);
                    const box2 = new THREE.Mesh(new THREE.BoxGeometry(cellSize*0.18, cellSize*0.7, cellSize*0.18), mat);
                    box1.position.set(0,0,0);
                    box2.position.set(0,0,0);
                    group.add(box1);
                    group.add(box2);
                    mesh = group;
                } else if (value === 'O') {
                    // 3D O: torus
                    mesh = new THREE.Mesh(
                        new THREE.TorusGeometry(cellSize*0.32, cellSize*0.13, 24, 48),
                        new THREE.MeshPhongMaterial({color: 0xd32f2f})
                    );
                } else {
                    // Empty: transparent sphere
                    mesh = new THREE.Mesh(
                        new THREE.SphereGeometry(cellSize/2, 32, 32),
                        new THREE.MeshPhongMaterial({color: 0xffffff, transparent: true, opacity: 0.25})
                    );
                    mesh.userData.isEmpty = true;
                }
                // Center the board
                const xPos = (x - (width3d-1)/2) * spacing;
                const yPos = ((height3d-1)/2 - y) * spacing;
                const zPos = (z - (depth3d-1)/2) * spacing;
                mesh.position.set(xPos, yPos, zPos);
                mesh.userData = {...mesh.userData, x, y, z, value};
                scene.add(mesh);
                cellMeshes.push(mesh);
            }
        }
    }
    animateThree();
}

function animateThree() {
    renderer.render(scene, camera);
    requestAnimationFrame(animateThree);
}

function onThreeClick(event) {
    if (!gameInProgress3d || aiThinking3d) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...cellMeshes], true);
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData && obj.userData.value === '.') {
            makeMove3d(obj.userData.x, obj.userData.y, obj.userData.z);
        }
    }
}

function onThreePointerMove(event) {
    if (isRotatingBoard) {
        const dx = event.clientX - lastPointer.x;
        const dy = event.clientY - lastPointer.y;
        scene.rotation.y += dx * 0.01;
        scene.rotation.x += dy * 0.01;
        lastPointer.x = event.clientX;
        lastPointer.y = event.clientY;
        return;
    }
    // Hover effect for empty cells
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cellMeshes, true);
    cellMeshes.forEach(mesh => {
        if (mesh.userData.isEmpty) {
            mesh.material.color.set(0xffffff);
            mesh.material.opacity = 0.25;
        }
    });
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData && obj.userData.isEmpty) {
            obj.material.color.set(0x888888);
            obj.material.opacity = 0.45;
        }
    }
}

function onThreePointerUp(event) {
    if (isRotatingBoard) {
        isRotatingBoard = false;
        document.body.style.cursor = '';
    }
}

startBtn3d.onclick = startGame3d;
restartBtn3d.onclick = restartGame3d;
undoBtn3d.onclick = undoMove3d;
aiBtn3d.onclick = aiMove3d;
quitBtn3d.onclick = quitGame3d;

document.addEventListener('DOMContentLoaded', () => {
    checkGameInProgress3d();
    updateBoardState3d().then(() => {
        setupThreeScene();
        renderBoard3d();
        updateStatus3d();
    });
});
