class Game:
    def __init__(self):
        self.board = []
        self.height = 0
        self.width = 0
        self.depth = 0
        self.win = 0
        self.rem = 0
        self.player = ''
        self.history = []

    def start(self, height: int = 3, width: int = 3, depth: int = 3, win: int = 3):
        self.board = [[['.' for i in range(width)] for j in range(height)] for k in range(depth)]
        self.height = height
        self.width = width
        self.depth = depth
        self.win = win
        self.rem = self.height * self.width
        self.player = 'X'
        self.history = []

    def switch(self):
        if self.player == 'X':
            self.player = 'O'
        elif self.player == 'O':
            self.player = 'X'

    def move(self, x, y, z):
        if 0 <= x < self.width and 0 <= y < self.height and 0 <= z < self.depth and self.board[y][x] == '.':
            self.history.append([[[self.board[i][j][k] for k in range(self.depth)] for j in range(self.width)]
                                 for i in range(self.height)])
            self.board[y][x][z] = self.player
            return True
        return False

    def undo(self):
        if len(self.history) > 0:
            self.board = self.history.pop()
            self.switch()
            self.rem += 1
            return True
        return False

    def get_valid_moves(self):
        return [(x, y, z) for z in range(self.depth) for y in range(self.height) for x in range(self.width)
                if self.board[y][x] == '.']

    def check_winner(self, x, y, z, dx, dy, dz):
        for i in range(y, y + dy * self.height, dy):
            for j in range(x, x + dx * self.width, dx):
                for k in range(z, z + dz * self.depth, dz):
                    if not (0 <= x < self.width and 0 <= y < self.height and 0 <= z < self.depth
                            and self.board[y][x][z] == self.player):
                        return None
            if i == y + dy * (self.height - 1):
                return self.player
        return None


def main():
    print("Welcome to the 3D Tic-Tac-Toe Solver!")


if __name__ == "__main__":
    main()
