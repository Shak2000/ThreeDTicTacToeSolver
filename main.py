import math


class Game:
    """
    Manages the state and logic of a 3D Tic-Tac-Toe game.
    """
    def __init__(self):
        """Initializes the game state variables."""
        self.board = None
        self.height = 0
        self.width = 0
        self.depth = 0
        self.win_length = 0
        self.player = 'X'
        self.history = []

    def start(self, height=3, width=3, depth=3, win_length=3):
        """Initializes or restarts the game with specified dimensions."""
        self.height = height
        self.width = width
        self.depth = depth
        self.win_length = win_length
        # Board dimensions are structured as: depth, height, width (z, y, x)
        self.board = [[['.' for _ in range(self.width)] for _ in range(self.height)] for _ in range(self.depth)]
        self.player = 'X'
        self.history = []
        print(f"\nNew game started. Board is {self.width}x{self.height}x{self.depth}. Win length is {win_length}.")

    def print_board(self):
        """Prints the current state of the board, layer by layer."""
        if not self.board:
            print("No game in progress.")
            return
        print("\nBoard state:")
        for z in range(self.depth):
            print(f"--- Layer {z} ---")
            for y in range(self.height):
                print(" ".join(self.board[z][y]))
        print(f"Current player: {self.player}")

    def switch_player(self):
        """Switches the current player between 'X' and 'O'."""
        self.player = 'O' if self.player == 'X' else 'X'

    def move(self, x, y, z):
        """
        Attempts to place the current player's piece at the given (x, y, z) coordinates.
        The internal board is stored as (z, y, x).
        Returns True if the move is valid and made, False otherwise.
        """
        if not (0 <= x < self.width and 0 <= y < self.height and 0 <= z < self.depth and self.board[z][y][x] == '.'):
            return False
        
        # Save current state for the undo functionality
        board_copy = [[row[:] for row in plane] for plane in self.board]
        self.history.append((board_copy, self.player))
        
        self.board[z][y][x] = self.player
        return True

    def undo(self):
        """Reverts the game to the state before the last move."""
        if not self.history:
            return False
        last_board, last_player = self.history.pop()
        self.board = last_board
        self.player = last_player
        return True

    def get_valid_moves(self):
        """Returns a list of all unoccupied cells as (x, y, z) tuples."""
        if not self.board:
            return []
        return [(x, y, z) for z in range(self.depth) for y in range(self.height) for x in range(self.width)
                if self.board[z][y][x] == '.']

    def is_draw(self):
        """Checks if the game is a draw (no more valid moves)."""
        return len(self.get_valid_moves()) == 0 and self.check_winner() is None

    def check_winner(self):
        """
        Checks the entire board for a winner.
        Returns the winning player ('X' or 'O') or None if there is no winner.
        """
        # 13 unique directions to check for a win in 3D space
        directions = [
            (1, 0, 0), (0, 1, 0), (0, 0, 1),  # Axes-aligned
            (1, 1, 0), (1, -1, 0), (1, 0, 1), (1, 0, -1), (0, 1, 1), (0, 1, -1),  # Planar diagonals
            (1, 1, 1), (1, 1, -1), (1, -1, 1), (-1, 1, 1)  # Space diagonals
        ]
        for z in range(self.depth):
            for y in range(self.height):
                for x in range(self.width):
                    if self.board[z][y][x] != '.':
                        player = self.board[z][y][x]
                        for dx, dy, dz in directions:  # Note: direction maps to x, y, z
                            count = 0
                            for i in range(self.win_length):
                                nx, ny, nz = x + i * dx, y + i * dy, z + i * dz
                                if (0 <= nx < self.width and 0 <= ny < self.height and 0 <= nz < self.depth and
                                        self.board[nz][ny][nx] == player):
                                    count += 1
                                else:
                                    break
                            if count == self.win_length:
                                return player
        return None

    # --- AI Methods ---

    def evaluate_board(self, ai_player):
        """
        Heuristic evaluation function for the minimax algorithm, generalized for any player.
        """
        opp_player = 'O' if ai_player == 'X' else 'X'
        winner = self.check_winner()
        if winner == ai_player:
            return float('inf')
        if winner == opp_player:
            return float('-inf')

        score = 0
        all_lines = self._get_all_possible_lines()
        for line in all_lines:
            score += self._evaluate_line(line, ai_player)

        center_x, center_y, center_z = (self.width - 1) / 2, (self.height - 1) / 2, (self.depth - 1) / 2
        for z in range(self.depth):
            for y in range(self.height):
                for x in range(self.width):
                    if self.board[z][y][x] != '.':
                        dist = math.sqrt((x - center_x)**2 + (y - center_y)**2 + (z - center_z)**2)
                        bonus = (math.sqrt(self.width**2 + self.height**2 + self.depth**2) - dist) * 0.1
                        if self.board[z][y][x] == ai_player:
                            score += bonus
                        else:
                            score -= bonus
        return score

    def _get_all_possible_lines(self):
        """Helper method to gather all possible winning lines on the board."""
        lines = []
        directions = [(1, 0, 0), (0, 1, 0), (0, 0, 1), (1, 1, 0), (1, -1, 0), 
                      (1, 0, 1), (1, 0, -1), (0, 1, 1), (0, 1, -1), (1, 1, 1), 
                      (1, 1, -1), (1, -1, 1), (-1, 1, 1)]
        
        for z in range(self.depth):
            for y in range(self.height):
                for x in range(self.width):
                    for dx, dy, dz in directions:
                        line = []
                        is_valid_line = True
                        for i in range(self.win_length):
                            nx, ny, nz = x + i * dx, y + i * dy, z + i * dz
                            if 0 <= nx < self.width and 0 <= ny < self.height and 0 <= nz < self.depth:
                                line.append(self.board[nz][ny][nx])
                            else:
                                is_valid_line = False
                                break
                        if is_valid_line:
                            lines.append(line)
        return lines

    def _evaluate_line(self, line, ai_player):
        """Scores a single line based on its contents for the given AI player."""
        opp_player = 'O' if ai_player == 'X' else 'X'
        my_pieces = line.count(ai_player)
        opp_pieces = line.count(opp_player)
        score = 0
        
        if opp_pieces == 0 and my_pieces > 0:
            score += my_pieces ** 2
        elif my_pieces == 0 and opp_pieces > 0:
            score -= opp_pieces ** 2
            
        return score

    def minimax(self, depth, alpha, beta, is_maximizing_player, ai_player):
        """Minimax algorithm with alpha-beta pruning, generalized for any player."""
        opp_player = 'O' if ai_player == 'X' else 'X'
        
        winner = self.check_winner()
        if winner is not None:
            return float('inf') if winner == ai_player else float('-inf')
        
        if self.is_draw() or depth == 0:
            return self.evaluate_board(ai_player)

        valid_moves = self.get_valid_moves()

        if is_maximizing_player:
            max_eval = float('-inf')
            for move in valid_moves:
                x, y, z = move
                self.board[z][y][x] = ai_player
                evaluation = self.minimax(depth - 1, alpha, beta, False, ai_player)
                self.board[z][y][x] = '.'  # Backtrack
                max_eval = max(max_eval, evaluation)
                alpha = max(alpha, evaluation)
                if beta <= alpha:
                    break  # Prune
            return max_eval
        else:  # Minimizing player
            min_eval = float('inf')
            for move in valid_moves:
                x, y, z = move
                self.board[z][y][x] = opp_player
                evaluation = self.minimax(depth - 1, alpha, beta, True, ai_player)
                self.board[z][y][x] = '.'  # Backtrack
                min_eval = min(min_eval, evaluation)
                beta = min(beta, evaluation)
                if beta <= alpha:
                    break  # Prune
            return min_eval

    def computer_move(self, search_depth):
        """
        Finds and executes the best move for the current player using AI.
        """
        ai_player = self.player
        opp_player = 'O' if ai_player == 'X' else 'X'
        valid_moves = self.get_valid_moves()

        # 1. Check for an immediate winning move for the AI player
        for move in valid_moves:
            x, y, z = move
            self.board[z][y][x] = ai_player
            if self.check_winner() == ai_player:
                self.board[z][y][x] = '.'
                print(f"\nComputer ('{ai_player}') chooses winning move (x,y,z): {move}")
                self.move(x, y, z)
                self.switch_player()
                return
            self.board[z][y][x] = '.'

        # 2. Check for an immediate block of the opponent's win
        for move in valid_moves:
            x, y, z = move
            self.board[z][y][x] = opp_player
            if self.check_winner() == opp_player:
                self.board[z][y][x] = '.'
                print(f"\nComputer ('{ai_player}') must block at (x,y,z): {move}")
                self.move(x, y, z)
                self.switch_player()
                return
            self.board[z][y][x] = '.'
        
        # 3. If no immediate win or block, use minimax
        best_move = None
        best_value = float('-inf')
        
        if len(valid_moves) == self.depth * self.height * self.width:
            center_x, center_y, center_z = self.width // 2, self.height // 2, self.depth // 2
            best_move = (center_x, center_y, center_z)
        else:
            print(f"Computer is thinking for player '{ai_player}' with search depth {search_depth}...")
            for move in valid_moves:
                x, y, z = move
                self.board[z][y][x] = ai_player
                move_value = self.minimax(search_depth - 1, float('-inf'), float('inf'), False, ai_player)
                self.board[z][y][x] = '.'  # Backtrack
                if move_value > best_value:
                    best_value = move_value
                    best_move = move

        if best_move:
            print(f"\nComputer ('{ai_player}') chooses move (x,y,z): {best_move}")
            self.move(best_move[0], best_move[1], best_move[2])
            self.switch_player()
        else:
            print("Computer could not find a move.")


def main():
    def get_player_move(curr_game):
        """Prompts the human player for their move and validates it."""
        while True:
            try:
                coords = input("Enter your move as x,y,z (e.g., 2,1,0): ")
                x, y, z = map(int, coords.split(','))
                if curr_game.move(x, y, z):
                    return True
                else:
                    print("Invalid move. Cell is either taken or out of bounds. Try again.")
            except ValueError:
                print("Invalid format. Please use comma-separated integers (x,y,z).")
            except Exception as ee:
                print(f"An error occurred: {ee}")

    """Main game loop and user interface."""
    print("Welcome to 3D Tic-Tac-Toe!")
    game = Game()

    while True:
        if game.board is None:
            # --- Game Not Started Menu ---
            choice = input("\nGame not started. Choose an option:\n1. Start new game\n2. Quit\n> ")
            if choice == '1':
                try:
                    dims = input("Enter dimensions (width,height,depth) [default 3,3,3]: ")
                    w, h, d = map(int, dims.split(',')) if dims else (3, 3, 3)
                    
                    win_len_str = input(f"Enter win length [default {min(d,h,w)}]: ")
                    win_len = int(win_len_str) if win_len_str else min(d, h, w)

                    game.start(h, w, d, win_len)
                    game.print_board()
                except ValueError:
                    print("Invalid input. Please use comma-separated integers for dimensions.")
                except Exception as e:
                    print(f"Error starting game: {e}")

            elif choice == '2':
                print("Goodbye!")
                break
            else:
                print("Invalid choice. Please enter 1 or 2.")
        else:
            # --- In-Game Menu ---
            winner = game.check_winner()
            if winner:
                game.print_board()
                print(f"\n*********************\n* Player {winner} wins! *\n*********************")
                game.board = None 
                continue
            
            if game.is_draw():
                game.print_board()
                print("\n*********************\n* The game is a draw! *\n*********************")
                game.board = None
                continue

            print(f"\n--- Player {game.player}'s turn ---")
            choice = input("Choose an option:\n"
                           "1. Make a move (Human)\n"
                           "2. Let computer make a move (AI)\n"
                           "3. Undo last move\n"
                           "4. Restart game\n"
                           "5. Quit game\n> ")
            
            if choice == '1':
                if get_player_move(game):
                    game.switch_player()
                    game.print_board()
            elif choice == '2':
                try:
                    depth_str = input(f"Enter AI search depth for player '{game.player}' [default 2]: ")
                    search_depth = int(depth_str) if depth_str else 2
                    game.computer_move(search_depth)
                    game.print_board()
                except ValueError:
                    print("Invalid input. Please enter an integer.")
            elif choice == '3':
                if game.undo():
                    print("Move undone.")
                    game.print_board()
                else:
                    print("Cannot undo. No moves have been made in this game.")
            elif choice == '4':
                game.start(game.height, game.width, game.depth, game.win_length)
                game.print_board()
            elif choice == '5':
                print("Goodbye!")
                break
            else:
                print("Invalid choice. Please select a valid option.")


if __name__ == "__main__":
    main()
