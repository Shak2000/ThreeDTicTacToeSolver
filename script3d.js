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
    // Remove previous renderer if any
    if (renderer) {
        renderer.dispose && renderer.dispose();
        board3dContainer.innerHTML = '';
    }
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 600/500, 0.1, 1000);
    camera.position.set(width3d * 1.2, height3d * 1.2, depth3d * 2.5);
    camera.lookAt(new THREE.Vector3(width3d/2-0.5, height3d/2-0.5, depth3d/2-0.5));
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xf4f4f4);
    renderer.setSize(600, 500);
    renderer.domElement.className = 'threejs-canvas';
    board3dContainer.appendChild(renderer.domElement);
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    // Add light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1,2,3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    // Add grid base
    const gridHelper = new THREE.GridHelper(Math.max(width3d, depth3d) + 1, Math.max(width3d, depth3d) + 1);
    gridHelper.position.set(width3d/2-0.5, -0.7, depth3d/2-0.5);
    scene.add(gridHelper);
    // Allow orbit controls if desired (optional, not included by default)
    // Add event listener for picking
    renderer.domElement.addEventListener('pointerdown', onThreeClick, false);
}

function renderBoard3d() {
    if (!scene || !boardState3d) return;
    // Remove previous cells
    cellMeshes.forEach(mesh => scene.remove(mesh));
    cellMeshes = [];
    const cellSize = 0.8;
    for (let z = 0; z < depth3d; z++) {
        for (let y = 0; y < height3d; y++) {
            for (let x = 0; x < width3d; x++) {
                const value = boardState3d[z][y][x];
                let color = 0xffffff;
                if (value === 'X') color = 0x1976d2;
                else if (value === 'O') color = 0xd32f2f;
                const geometry = new THREE.SphereGeometry(cellSize/2, 32, 32);
                const material = new THREE.MeshPhongMaterial({color, transparent: true, opacity: value === '.' ? 0.25 : 1});
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(x, height3d-1-y, z); // y is inverted for visual top-down
                sphere.userData = {x, y, z, value};
                if (value === '.') {
                    sphere.cursor = 'pointer';
                }
                scene.add(sphere);
                cellMeshes.push(sphere);
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
    const intersects = raycaster.intersectObjects(cellMeshes);
    for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object;
        if (obj.userData.value === '.') {
            makeMove3d(obj.userData.x, obj.userData.y, obj.userData.z);
            break;
        }
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
