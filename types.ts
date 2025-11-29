export enum Player {
  None = 0,
  Black = 1, // Usually goes first
  White = 2
}

export interface CellPosition {
  row: number;
  col: number;
}

export type BoardState = Player[][];

export enum GameStatus {
  Playing = 'PLAYING',
  BlackWon = 'BLACK_WON',
  WhiteWon = 'WHITE_WON',
  Draw = 'DRAW'
}

export const BOARD_SIZE = 15;