import React, { useState, useCallback, useEffect } from 'react';
import Board from './components/Board';
import { createEmptyBoard, checkWin, isBoardFull } from './utils/gameLogic';
import { BoardState, GameStatus, Player } from './types';
import { getBestMove } from './services/geminiService';
import { Loader2, RefreshCcw, Cpu, User, Trophy, Play } from 'lucide-react';

function App() {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Black);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Playing);
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ row: number, col: number } | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string>("");

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(Player.Black);
    setGameStatus(GameStatus.Playing);
    setLastMove(null);
    setIsAiThinking(false);
    setAiReasoning("");
  };

  const handleMove = useCallback(async (row: number, col: number) => {
    if (gameStatus !== GameStatus.Playing || board[row][col] !== Player.None) return;

    // Optimistic Update
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setLastMove({ row, col });

    // Check Win/Draw
    if (checkWin(newBoard, row, col, currentPlayer)) {
      setGameStatus(currentPlayer === Player.Black ? GameStatus.BlackWon : GameStatus.WhiteWon);
      return;
    } else if (isBoardFull(newBoard)) {
      setGameStatus(GameStatus.Draw);
      return;
    }

    // Switch Player
    const nextPlayer = currentPlayer === Player.Black ? Player.White : Player.Black;
    setCurrentPlayer(nextPlayer);

  }, [board, currentPlayer, gameStatus]);

  // AI Turn Effect
  useEffect(() => {
    const aiTurn = async () => {
      if (isAiMode && currentPlayer === Player.White && gameStatus === GameStatus.Playing) {
        setIsAiThinking(true);
        
        // Small artificial delay for realism
        await new Promise(resolve => setTimeout(resolve, 600));

        const aiMove = await getBestMove(board, Player.White);
        
        setIsAiThinking(false);

        if (aiMove) {
          if (aiMove.reasoning) setAiReasoning(aiMove.reasoning);
          handleMove(aiMove.row, aiMove.col);
        } else {
          console.warn("AI failed, using random move fallback");
          const emptyCells = [];
          for(let r=0; r<15; r++) for(let c=0; c<15; c++) if(board[r][c] === Player.None) emptyCells.push({r,c});
          if(emptyCells.length > 0) {
             const random = emptyCells[Math.floor(Math.random() * emptyCells.length)];
             handleMove(random.r, random.c);
          }
        }
      }
    };

    aiTurn();
  }, [currentPlayer, isAiMode, gameStatus, board, handleMove]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col items-center py-8 px-4 font-serif selection:bg-amber-900 selection:text-white">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 via-stone-950 to-black z-0" />

      {/* Header */}
      <header className="relative z-10 mb-10 text-center space-y-2">
        <h1 className="text-5xl md:text-6xl font-bold text-amber-500/90 tracking-widest drop-shadow-lg" style={{ fontFamily: '"Noto Serif JP", serif' }}>
          五子棋
        </h1>
        <div className="h-[1px] w-24 bg-amber-800 mx-auto my-4"></div>
        <p className="text-stone-500 font-light tracking-[0.3em] uppercase text-xs">Zen Gomoku • Master Grade</p>
      </header>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-12 w-full max-w-7xl justify-center">
        
        {/* Game Board Section */}
        <div className="w-full max-w-[640px] flex-shrink-0">
           <Board 
             board={board} 
             onCellClick={handleMove} 
             lastMove={lastMove}
             disabled={gameStatus !== GameStatus.Playing || (isAiMode && currentPlayer === Player.White)}
           />
        </div>

        {/* Sidebar Controls */}
        <div className="w-full max-w-sm lg:w-80 flex flex-col gap-6">
          
          {/* Status Card */}
          <div className="bg-gradient-to-b from-stone-800 to-stone-900 border border-stone-700/50 p-6 rounded-sm shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 opacity-80" />
             
             <h2 className="text-lg font-bold mb-6 text-stone-400 uppercase tracking-widest flex items-center justify-between">
                Status
                <Trophy size={16} className="text-amber-600" />
             </h2>
             
             {gameStatus === GameStatus.Playing ? (
               <div className="flex flex-col items-center justify-center py-4 gap-4">
                  <div className={`
                    w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-500
                    ${currentPlayer === Player.Black 
                        ? 'bg-gradient-to-br from-gray-800 to-black ring-2 ring-amber-500/50 scale-110' 
                        : 'bg-gradient-to-br from-white to-stone-300 opacity-50 scale-90 grayscale'}
                  `}>
                    <div className="w-full h-full rounded-full bg-black/10"></div>
                  </div>
                  
                  <div className="text-center">
                      <span className="text-3xl font-light text-amber-100 block mb-1">
                        {currentPlayer === Player.Black ? "Black" : "White"}
                      </span>
                      <span className="text-xs text-stone-500 uppercase tracking-wider">To Move</span>
                  </div>

                  {isAiThinking && (
                      <div className="flex items-center gap-2 text-amber-500 text-sm animate-pulse mt-2">
                          <Loader2 size={14} className="animate-spin" />
                          <span>Gemini is contemplating...</span>
                      </div>
                  )}
               </div>
             ) : (
               <div className="py-8 text-center animate-in zoom-in-95 duration-300">
                 <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 drop-shadow-sm">
                    {gameStatus === GameStatus.BlackWon && "Black Wins"}
                    {gameStatus === GameStatus.WhiteWon && "White Wins"}
                    {gameStatus === GameStatus.Draw && "Draw"}
                 </span>
                 <div className="mt-4 text-stone-400 text-sm">Game Over</div>
               </div>
             )}
          </div>

          {/* AI Info Card */}
          {isAiMode && aiReasoning && (
             <div className="bg-stone-900/80 border border-stone-800 p-5 rounded-sm shadow-lg backdrop-blur-sm">
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <Cpu size={14} /> Analysis
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed font-serif italic border-l-2 border-amber-900/50 pl-4">
                   "{aiReasoning}"
                </p>
             </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-1 gap-4 mt-auto">
             <button
               onClick={() => setIsAiMode(!isAiMode)}
               className={`
                 flex items-center justify-center gap-3 px-6 py-4 rounded-sm font-medium transition-all duration-300
                 border
                 ${isAiMode 
                   ? 'border-amber-900/40 bg-gradient-to-r from-amber-950/30 to-stone-900 text-amber-500 hover:border-amber-800' 
                   : 'border-stone-700 bg-stone-800 text-stone-400 hover:bg-stone-700'}
               `}
             >
               {isAiMode ? <Cpu size={18} /> : <User size={18} />}
               <span className="tracking-wide text-sm">{isAiMode ? "Opponent: AI (Gemini)" : "Opponent: Human"}</span>
             </button>

             <button
               onClick={handleReset}
               className="group flex items-center justify-center gap-3 px-6 py-4 bg-stone-200 text-stone-900 rounded-sm font-bold hover:bg-white transition-all shadow-lg active:scale-[0.98]"
             >
               <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
               <span className="tracking-widest text-sm uppercase">New Game</span>
             </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;