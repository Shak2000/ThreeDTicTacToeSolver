from fastapi import FastAPI, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from main import Game

game = Game()
app = FastAPI()


@app.get("/")
async def get_ui():
    return FileResponse("index.html")


@app.get("/styles.css")
async def get_styles():
    return FileResponse("styles.css")


@app.get("/script.js")
async def get_script():
    return FileResponse("script.js")


@app.get("/index3d.html")
async def get_ui_3d():
    return FileResponse("index3d.html")


@app.get("/script3d.js")
async def get_script_3d():
    return FileResponse("script3d.js")


@app.post("/start")
async def start(
    height: int = Query(3),
    width: int = Query(3),
    depth: int = Query(3),
    win_length: int = Query(3)
):
    game.start(height, width, depth, win_length)


@app.post("/switch_player")
async def switch_player():
    game.switch_player()


@app.post("/move")
async def move(
    x: int = Query(...),
    y: int = Query(...),
    z: int = Query(...)
):
    return game.move(x, y, z)


@app.post("/undo")
async def undo():
    return game.undo()


@app.get("/get_valid_moves")
async def get_valid_moves():
    return game.get_valid_moves()


@app.get("/is_draw")
async def is_draw():
    return game.is_draw()


@app.get("/check_winner")
async def check_winner():
    return game.check_winner()


@app.get("/evaluate_board")
async def evaluate_board(ai_player):
    return game.evaluate_board(ai_player)


@app.get("/minimax")
async def minimax(depth, alpha, beta, is_maximizing_player, ai_player):
    return game.minimax(depth, alpha, beta, is_maximizing_player, ai_player)


@app.post("/search_depth")
async def computer_move(search_depth: int = Query(...)):
    game.computer_move(search_depth)


@app.post("/quit")
async def quit_game():
    game.board = None
    return {"message": "Game quit."}


@app.get("/get_board")
async def get_board():
    return {"board": game.board, "player": game.player}
