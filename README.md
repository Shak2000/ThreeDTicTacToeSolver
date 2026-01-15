# 3D Tic-Tac-Toe Solver

A fully-featured 3D Tic-Tac-Toe game with AI solver, offering both traditional 2D layered view and immersive 3D visualization using Three.js.

## Features

- **Customizable Board Dimensions**: Play on boards from 2×2×2 to 6×6×6
- **Variable Win Conditions**: Set win length from 2 to 6 pieces in a row
- **Dual Interface Options**:
  - Traditional 2D layered view for easy gameplay
  - Interactive 3D visualization with rotation and hover effects
- **AI Opponent**: Minimax algorithm with alpha-beta pruning
- **Game Management**: Undo moves, restart games, and quit functionality
- **Multiple Play Modes**: Command-line interface and web-based GUI

## Screenshots

The game offers both 2D layered visualization and 3D perspective views:
- **2D View**: Multiple layers displayed side-by-side for clear game state visualization
- **3D View**: Fully rotatable 3D board with interactive pieces and hover effects

## Installation

### Prerequisites

- Python 3.7 or higher
- FastAPI
- Uvicorn (for web server)
- Docker (optional, for containerized deployment)
- Google Cloud CLI (optional, for Cloud Run deployment)

### Setup

1. Clone or download the project files
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Web Interface (Recommended)

1. Start the web server:
   ```bash
   uvicorn app:app --reload
   ```

2. Open your browser and navigate to:
   - **2D Interface**: `http://localhost:8000/`
   - **3D Interface**: `http://localhost:8000/index3d.html`

### Docker

Run the app in a Docker container:

```bash
# Build the image
docker build -t tictactoe-3d .

# Run locally
docker run -p 8080:8080 tictactoe-3d
```

Then open http://localhost:8080/

### Deploy to Google Cloud Run

Deploy to Cloud Run using the included script:

```bash
./deploy.sh
```

This script:
- Builds the Docker image for AMD64 architecture
- Pushes to Google Container Registry
- Deploys to Cloud Run in us-west1

Prerequisites: `gcloud` CLI installed and configured with a GCP project.

### Command Line Interface

Run the standalone game:
```bash
python main.py
```

## Game Rules

### Objective
Be the first player to get the specified number of pieces (default: 3) in a row in any direction.

### Winning Directions
In 3D space, you can win by aligning pieces in any of these 13 directions:
- **Axis-aligned**: Along X, Y, or Z axes
- **Planar diagonals**: Diagonal lines within XY, XZ, or YZ planes
- **Space diagonals**: True 3D diagonal lines through the cube

### Game Flow
1. Configure board dimensions (width, height, depth) and win length
2. Players alternate turns (X goes first)
3. Click on empty cells to place your piece
4. Use AI assistance or play against the computer
5. First to achieve the win condition wins!

## AI Algorithm

The game uses a **Minimax algorithm with alpha-beta pruning** for AI moves:

- **Evaluation Function**: Considers piece positioning, line potential, and center control
- **Search Depth**: Configurable from 1-6 levels (higher = stronger but slower)
- **Optimization**: Alpha-beta pruning significantly reduces search space
- **Strategy**: Prioritizes winning moves, blocking opponent wins, then optimal positioning

## Web Interface Features

### 2D Interface (`index.html`)
- Layer-by-layer board visualization
- Clear cell highlighting and player indicators
- Responsive design with intuitive controls

### 3D Interface (`index3d.html`)
- **Interactive 3D Board**: Full rotation with mouse/touch controls
- **Visual Feedback**: Hover effects and smooth animations
- **Rotation Icon**: Dedicated control for board rotation
- **Dynamic Lighting**: Professional 3D rendering with shadows
- **Responsive Design**: Adapts to different screen sizes

### Controls
- **Start Game**: Initialize new game with custom settings
- **Restart**: Reset current game with same settings
- **Undo**: Revert last move
- **AI Move**: Let computer make optimal move
- **AI Depth**: Adjust computer difficulty (1-6)
- **Quit Game**: End current game

## File Structure

```
3d-tictactoe-solver/
├── main.py           # Core game logic and CLI interface
├── app.py            # FastAPI web server
├── index.html        # 2D web interface
├── index3d.html      # 3D web interface
├── script.js         # 2D interface JavaScript
├── script3d.js       # 3D interface JavaScript (Three.js)
├── styles.css        # Shared styling
├── Dockerfile        # Docker container configuration
├── requirements.txt  # Python dependencies
├── deploy.sh         # Cloud Run deployment script
└── README.md         # This file
```

## Technical Details

### Backend (Python)
- **Game Class**: Manages board state, moves, and game logic
- **AI Implementation**: Minimax with alpha-beta pruning
- **FastAPI Server**: RESTful API for web interface communication

### Frontend (JavaScript)
- **2D Rendering**: DOM manipulation for layered board display
- **3D Rendering**: Three.js for WebGL-based 3D visualization
- **Interactive Controls**: Mouse/touch support for moves and rotation
- **Responsive Design**: Adapts to various screen sizes

### API Endpoints
- `POST /start` - Initialize new game
- `POST /move` - Make a move
- `POST /search_depth` - AI move with specified depth
- `GET /get_board` - Retrieve current board state
- `GET /check_winner` - Check for game winner
- `POST /undo` - Undo last move
- And more...

## Performance Considerations

- **Board Size**: Larger boards (5×5×5+) may experience slower AI response
- **AI Depth**: Higher depths provide better play but increase computation time
- **3D Rendering**: Modern browsers with WebGL support recommended for 3D interface

## Browser Compatibility

- **2D Interface**: Works in all modern browsers
- **3D Interface**: Requires WebGL support (Chrome, Firefox, Safari, Edge)

## Contributing

This project demonstrates advanced game AI concepts and 3D web visualization. Potential improvements:
- Multiplayer network support
- Additional AI difficulty levels
- Tournament mode
- Save/load game functionality
- Mobile app version

## License

This project is open source and available under the MIT License.

---

**Enjoy playing 3D Tic-Tac-Toe!** 🎮
