# 3D Tic-Tac-Toe Solver

A web-based and command-line 3D Tic-Tac-Toe game with AI opponent using minimax algorithm with alpha-beta pruning.

## Features

- **Customizable Board Dimensions**: Configure width, height, depth (2-6 for each dimension)
- **Variable Win Conditions**: Set custom win length requirements
- **AI Opponent**: Computer player with adjustable difficulty (search depth 1-6)
- **Smart AI Strategy**: Prioritizes winning moves and blocks opponent wins
- **Interactive Web Interface**: Clean, responsive UI for easy gameplay
- **Command-Line Interface**: Terminal-based gameplay option
- **Game Management**: Undo moves, restart games, and quit functionality
- **Real-time Status Updates**: Track current player, game state, and winner

## Quick Start

### Web Interface

1. Install dependencies:
   ```bash
   pip install fastapi uvicorn
   ```

2. Start the web server:
   ```bash
   uvicorn app:app --reload
   ```

3. Open your browser to `http://localhost:8000`

4. Configure game settings and click "Start Game"

### Command Line Interface

Run the game directly in your terminal:
```bash
python main.py
```

## Game Rules

### Objective
Be the first player to align your pieces (X or O) in a straight line of the specified win length.

### Winning Conditions
A winning line can be formed in any of these 13 directions within the 3D space:
- **Axis-aligned**: Along X, Y, or Z axes
- **Planar diagonals**: Diagonal lines within XY, XZ, or YZ planes
- **Space diagonals**: True 3D diagonal lines through the cube

### Coordinates
- **X-axis**: Left to right (width)
- **Y-axis**: Top to bottom (height) 
- **Z-axis**: Front layer to back layer (depth)

## Web Interface Controls

### Pre-Game Settings
- **Width/Height/Depth**: Board dimensions (2-6 each)
- **Win Length**: Number of pieces needed in a line to win
- **Start Game**: Begin a new game with current settings

### In-Game Controls
- **Click any empty cell** to make your move
- **AI Move**: Let the computer make a move for current player
- **AI Depth**: Adjust computer difficulty (higher = smarter but slower)
- **Undo**: Reverse the last move
- **Restart**: Start over with same settings
- **Quit Game**: Return to setup screen

## AI Algorithm

The computer opponent uses the **minimax algorithm with alpha-beta pruning**:

### Strategy Priority
1. **Winning Move**: Takes any immediately winning move
2. **Blocking Move**: Blocks opponent's immediate win
3. **Minimax Evaluation**: Uses heuristic scoring for optimal play

### Heuristic Evaluation
- **Line Control**: Scores based on piece alignment potential
- **Center Preference**: Favors central positions for strategic advantage
- **Win Detection**: Assigns infinite value to winning/losing positions

### Difficulty Levels
- **Depth 1-2**: Beginner (fast, basic strategy)
- **Depth 3-4**: Intermediate (balanced speed/intelligence)
- **Depth 5-6**: Advanced (slower but very challenging)

## File Structure

```
├── main.py          # Core game logic and CLI interface
├── app.py           # FastAPI web server
├── index.html       # Web interface HTML
├── styles.css       # Web interface styling
├── script.js        # Web interface JavaScript
└── README.md        # This documentation
```

## API Endpoints

The web interface communicates with these FastAPI endpoints:

### Game Management
- `POST /start` - Initialize new game with dimensions
- `POST /quit` - End current game
- `GET /get_board` - Retrieve board state and current player

### Gameplay
- `POST /move` - Make a move at specified coordinates
- `POST /switch_player` - Switch to next player
- `POST /undo` - Undo last move
- `POST /search_depth` - Execute AI move with specified depth

### Game State
- `GET /get_valid_moves` - List available moves
- `GET /check_winner` - Check for winning player
- `GET /is_draw` - Check for draw condition

## Command Line Interface

### Starting a Game
```
Enter dimensions (width,height,depth) [default 3,3,3]: 4,4,3
Enter win length [default 3]: 3
```

### Making Moves
```
Enter your move as x,y,z (e.g., 2,1,0): 1,1,1
```

### Menu Options
1. Make a move (Human)
2. Let computer make a move (AI)
3. Undo last move
4. Restart game
5. Quit game

## Example Gameplay

### Standard 3×3×3 Game
```
--- Layer 0 ---
. . .
. X .
. . .
--- Layer 1 ---
. . .
. O .
. . .
--- Layer 2 ---
. . .
. . .
. . .
```

### Custom 4×4×2 Game
Create larger boards for longer, more strategic games with different win conditions.

## Tips for Players

### Strategy Tips
- **Control the center**: Central positions offer more winning opportunities
- **Think in 3D**: Consider all 13 possible line directions
- **Block early**: Don't let opponent build long sequences
- **Plan layers**: Use multiple layers to create complex threats

### AI Tips
- **Start with depth 2**: Good balance of speed and challenge
- **Increase gradually**: Higher depths for tougher opponents
- **Watch for patterns**: AI learns to recognize winning/blocking moves

## Requirements

- **Python 3.7+**
- **FastAPI** (for web interface)
- **Uvicorn** (ASGI server)
- **Modern web browser** (for web interface)

## License

This project is open source and available under the MIT License.

## Contributing

Contributions welcome! Areas for improvement:
- Enhanced AI evaluation functions
- Additional game modes or variants
- Performance optimizations
- UI/UX enhancements
- Mobile responsiveness improvements
