import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BOARD_SIZE, BoardState, Player } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const moveSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    row: { type: Type.INTEGER, description: "Row index (0-14)" },
    col: { type: Type.INTEGER, description: "Column index (0-14)" },
    reasoning: { type: Type.STRING, description: "Brief strategy explanation" }
  },
  required: ["row", "col"],
};

export const getBestMove = async (
  board: BoardState,
  currentPlayer: Player
): Promise<{ row: number; col: number; reasoning?: string } | null> => {
  
  // Convert board to a simpler string representation to save tokens and make it clear for the model
  const boardStr = board.map(row => 
    row.map(cell => (cell === Player.None ? '.' : cell === Player.Black ? 'B' : 'W')).join(' ')
  ).join('\n');

  const playerStr = currentPlayer === Player.Black ? 'Black' : 'White';
  const opponentStr = currentPlayer === Player.Black ? 'White' : 'Black';

  const prompt = `
    You are a Grandmaster Gomoku (Five-in-a-Row) player.
    The board size is ${BOARD_SIZE}x${BOARD_SIZE}.
    Current Board State:
    ${boardStr}

    You are playing as ${playerStr} (represented by '${currentPlayer === Player.Black ? 'B' : 'W'}').
    The opponent is ${opponentStr}.
    
    The goal is to get 5 stones in a row horizontally, vertically, or diagonally.
    
    Analyze the board.
    1. Check if you can win immediately.
    2. Check if the opponent will win next turn and block them.
    3. If neither, find the most strategic position to build an attack or strengthen defense.
    
    Return the coordinates (0-indexed) for the next move.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: moveSchema,
        temperature: 0.2, // Low temperature for more deterministic/strategic play
      },
    });

    const text = response.text;
    if (!text) return null;

    const move = JSON.parse(text);
    return { row: move.row, col: move.col, reasoning: move.reasoning };

  } catch (error) {
    console.error("Error fetching move from Gemini:", error);
    return null;
  }
};