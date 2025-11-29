import { BOARD_SIZE, BoardState, Player } from "../types";

export const createEmptyBoard = (): BoardState => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(Player.None));
};

export const checkWin = (board: BoardState, lastRow: number, lastCol: number, player: Player): boolean => {
  const directions = [
    [0, 1],   // Horizontal
    [1, 0],   // Vertical
    [1, 1],   // Diagonal (Top-Left to Bottom-Right)
    [1, -1]   // Anti-Diagonal (Top-Right to Bottom-Left)
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    // Check forward direction
    for (let i = 1; i < 5; i++) {
      const r = lastRow + dr * i;
      const c = lastCol + dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
      } else {
        break;
      }
    }

    // Check backward direction
    for (let i = 1; i < 5; i++) {
      const r = lastRow - dr * i;
      const c = lastCol - dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        count++;
      } else {
        break;
      }
    }

    if (count >= 5) return true;
  }

  return false;
};

export const isBoardFull = (board: BoardState): boolean => {
  return board.every(row => row.every(cell => cell !== Player.None));
};