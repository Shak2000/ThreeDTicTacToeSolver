const boardContainer = document.getElementById('boardContainer');
const statusDiv = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const undoBtn = document.getElementById('undoBtn');
const aiBtn = document.getElementById('aiBtn');

let width = 3, height = 3, depth = 3, winLength = 3, aiDepth = 2;
let gameInProgress = false;
let aiThinking = false;

function getSettings() {
    width = parseInt(document.getElementById('width').value);
    height = parseInt(document.getElementById('height').value);
    depth = parseInt(document.getElementById('depth').value);
    winLength = parseInt(document.getElementById('winLength').value);
    aiDepth = parseInt(document.getElementById('aiDepth').value);
}

async function checkGameInProgress() {
    // If there are valid moves, assume game is in progress
    const res = await fetch('/get_valid_moves');
    const validMoves = await res.json();
    gameInProgress = validMoves.length > 0;
    updateControls();
}

async function startGame() {
    getSettings();
    await fetch(`/start?height=${height}&width=${width}&depth=${depth}&win_length=${winLength}`, { method: 'POST' });
    await renderBoard();
    statusDiv.textContent = `Game started! Player X's turn.`;
    gameInProgress = true;
    updateControls();
}

async function restartGame() {
    await startGame();
}

async function undoMove() {
    await fetch('/undo', { method: 'POST' });
    await renderBoard();
    await updateStatus();
}

function setAIThinking(thinking) {
    aiThinking = thinking;
    // Disable all controls and board
    document.querySelectorAll('button, input').forEach(el => {
        if (el.id !== 'aiDepth') el.disabled = thinking;
    });
    if (thinking) {
        statusDiv.textContent = 'Computer is thinking ...';
    }
}

async function aiMove() {
    getSettings();
    // Prevent AI move if there is a winner
    const winnerRes = await fetch('/check_winner');
    const winner = await winnerRes.json();
    if (winner) {
        statusDiv.textContent = `Player ${winner} has already won!`;
        return;
    }
    setAIThinking(true);
    await fetch(`/search_depth?search_depth=${aiDepth}`, { method: 'POST' });
    await renderBoard();
    await updateStatus();
    setAIThinking(false);
}

async function quitGame() {
    await fetch('/quit', { method: 'POST' });
    gameInProgress = false;
    updateControls();
    boardContainer.innerHTML = '';
    statusDiv.textContent = 'Game quit. Start a new game!';
}

async function makeMove(x, y, z) {
    if (aiThinking) return;
    // Prevent moves if there is a winner
    const winnerRes = await fetch('/check_winner');
    const winner = await winnerRes.json();
    if (winner) {
        statusDiv.textContent = `Player ${winner} has already won!`;
        return;
    }
    const res = await fetch(`/move?x=${x}&y=${y}&z=${z}`, { method: 'POST' });
    const valid = await res.json();
    if (!valid) {
        statusDiv.textContent = 'Invalid move!';
        return;
    }
    await fetch('/switch_player', { method: 'POST' });
    await renderBoard();
    await updateStatus();
}

async function renderBoard() {
    const res = await fetch('/get_board');
    const data = await res.json();
    const board = data.board;
    // If board is null, clear UI
    if (!board) {
        boardContainer.innerHTML = '';
        return;
    }
    // Get board dimensions
    const depth = board.length;
    const height = board[0].length;
    const width = board[0][0].length;
    boardContainer.innerHTML = '';
    for (let z = 0; z < depth; z++) {
        const layerDiv = document.createElement('div');
        layerDiv.className = 'layer';
        const title = document.createElement('div');
        title.className = 'layer-title';
        title.textContent = `Layer ${z}`;
        layerDiv.appendChild(title);
        const boardDiv = document.createElement('div');
        boardDiv.className = 'board';
        boardDiv.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cellBtn = document.createElement('button');
                cellBtn.className = 'cell';
                cellBtn.dataset.x = x;
                cellBtn.dataset.y = y;
                cellBtn.dataset.z = z;
                const value = board[z][y][x];
                if (value === '.') {
                    cellBtn.textContent = '';
                    cellBtn.disabled = false;
                    cellBtn.onclick = () => makeMove(x, y, z);
                } else {
                    cellBtn.textContent = value;
                    cellBtn.classList.add(value);
                    cellBtn.disabled = true;
                }
                boardDiv.appendChild(cellBtn);
            }
        }
        layerDiv.appendChild(boardDiv);
        boardContainer.appendChild(layerDiv);
    }
}

async function updateStatus() {
    if (!gameInProgress) {
        statusDiv.textContent = '';
        return;
    }
    // Check winner
    const winnerRes = await fetch('/check_winner');
    const winner = await winnerRes.json();
    if (winner) {
        statusDiv.textContent = `Player ${winner} wins!`;
        disableAllCells();
        return;
    }
    // Check draw
    const drawRes = await fetch('/is_draw');
    const isDraw = await drawRes.json();
    if (isDraw) {
        statusDiv.textContent = `It's a draw!`;
        disableAllCells();
        return;
    }
    // Otherwise, show current player
    const boardRes = await fetch('/get_board');
    const boardData = await boardRes.json();
    statusDiv.textContent = `Player ${boardData.player}'s turn.`;
}

function disableAllCells() {
    document.querySelectorAll('.cell').forEach(cell => cell.disabled = true);
}

function updateControls() {
    document.getElementById('preGameControls').style.display = gameInProgress ? 'none' : '';
    document.getElementById('inGameControls').style.display = gameInProgress ? '' : 'none';
    if (!gameInProgress) {
        statusDiv.textContent = '';
    }
}

startBtn.onclick = startGame;
restartBtn.onclick = restartGame;
undoBtn.onclick = undoMove;
aiBtn.onclick = aiMove;
document.getElementById('quitBtn').onclick = quitGame;

document.addEventListener('DOMContentLoaded', () => {
    checkGameInProgress();
    renderBoard();
    updateStatus();
});
