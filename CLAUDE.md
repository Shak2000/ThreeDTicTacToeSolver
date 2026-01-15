# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

3D Tic-Tac-Toe game with AI solver. Features customizable board dimensions (2x2x2 to 6x6x6), variable win conditions, and both 2D layered and 3D (Three.js) visualization interfaces.

## Commands

### Run Web Server
```bash
uvicorn app:app --reload
```
- 2D interface: http://localhost:8000/
- 3D interface: http://localhost:8000/index3d.html

### Run CLI
```bash
python main.py
```

## Architecture

### Backend
- **main.py**: Core `Game` class with all game logic, board state management, and AI implementation
- **app.py**: FastAPI server exposing game functionality via REST endpoints, serves static files

### Frontend
- **index.html / script.js**: 2D layered board visualization
- **index3d.html / script3d.js**: 3D WebGL visualization using Three.js (loaded via CDN)
- **styles.css**: Shared styling

### Key Concepts

**Board Coordinates**: The board is stored as `board[z][y][x]` (depth, height, width), but moves are specified as `(x, y, z)`.

**AI Algorithm**: Minimax with alpha-beta pruning. The `computer_move()` method:
1. First checks for immediate winning moves
2. Then checks for blocking opponent wins
3. Falls back to minimax search with configurable depth

**Win Detection**: Checks 13 unique directions in 3D space (3 axis-aligned, 6 planar diagonals, 4 space diagonals).

### API Endpoints
Key endpoints in app.py:
- `POST /start?height=&width=&depth=&win_length=` - Initialize game
- `POST /move?x=&y=&z=` - Make a move
- `POST /search_depth?search_depth=` - AI makes a move
- `GET /get_board` - Returns board state and current player
- `GET /check_winner` - Check for winner
- `POST /undo` - Undo last move
