import React from 'react';
import { BOARD_SIZE, BoardState, Player } from '../types';
import Stone from './Stone';

interface BoardProps {
  board: BoardState;
  onCellClick: (row: number, col: number) => void;
  lastMove: { row: number, col: number } | null;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, lastMove, disabled }) => {
  
  // Calculate grid rendering using SVG for sharpness
  const renderGridSvg = () => {
    // We use a coordinate system of 0 to 100 for the board surface
    // The margin is half a cell size.
    // 15 cells means 14 intervals.
    // Let's create a coordinate system where lines fall exactly on integers or clean percentages.
    
    const lines = [];
    const starPoints = [];
    
    // Grid Setup
    // Total lines: BOARD_SIZE (15)
    // We want some padding on edges.
    
    // Let's assume the board goes from 0 to 100.
    // To make stones fit perfectly, we need 15 equally spaced points.
    // gap = 100 / 15 = 6.6666
    // offset = gap / 2 = 3.3333
    
    const gap = 100 / BOARD_SIZE;
    const offset = gap / 2;

    // Grid Lines
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = offset + i * gap;
      
      // Horizontal
      lines.push(
        <line 
          key={`h-${i}`} 
          x1={offset} 
          y1={pos} 
          x2={100 - offset} 
          y2={pos} 
          stroke="#000" 
          strokeWidth="0.15" // Very thin, sharp ink lines
          opacity="0.8"
        />
      );

      // Vertical
      lines.push(
        <line 
          key={`v-${i}`} 
          x1={pos} 
          y1={offset} 
          x2={pos} 
          y2={100 - offset} 
          stroke="#000" 
          strokeWidth="0.15" 
          opacity="0.8"
        />
      );
    }

    // Star Points (Hoshi)
    // 3, 3; 3, 11; 7, 7; 11, 3; 11, 11 (Indices)
    const points = [
      {r: 3, c: 3}, {r: 3, c: 11},
      {r: 7, c: 7},
      {r: 11, c: 3}, {r: 11, c: 11}
    ];

    points.forEach((p, i) => {
        const cx = offset + p.c * gap;
        const cy = offset + p.r * gap;
        starPoints.push(
            <circle key={`star-${i}`} cx={cx} cy={cy} r="0.8" fill="#000" />
        );
    });

    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <filter id="ink-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.05" />
        </filter>
        <g filter="url(#ink-blur)">
            {lines}
            {starPoints}
        </g>
      </svg>
    );
  };

  return (
    <div className="relative group perspective-1000">
        {/* Main Board Block */}
        <div className="relative shadow-2xl rounded-sm transform transition-transform duration-500 ease-out">
            
            {/* Top Surface (The playing area) */}
            <div className="wood-kaya relative aspect-square w-full rounded-t-sm shadow-inner z-10 overflow-hidden border-t border-white/20">
                
                {/* SVG Grid */}
                {renderGridSvg()}

                {/* Interactive Layer */}
                <div 
                    className="absolute inset-0 grid z-10"
                    style={{
                        gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                        gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`
                    }}
                >
                    {board.map((row, rIdx) => (
                        row.map((cell, cIdx) => {
                            const isLast = lastMove?.row === rIdx && lastMove?.col === cIdx;
                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    onClick={() => !disabled && onCellClick(rIdx, cIdx)}
                                    className={`
                                        relative flex items-center justify-center cursor-pointer
                                        ${!disabled && cell === Player.None ? 'hover:after:content-[""] hover:after:w-3 hover:after:h-3 hover:after:bg-black/20 hover:after:rounded-full hover:after:absolute' : ''}
                                    `}
                                >
                                    <Stone player={cell} isLastMove={isLast} />
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Board Thickness (3D Side View) */}
            <div className="h-12 w-full wood-kaya-side rounded-b-lg relative border-t border-black/10">
                {/* Highlight on the edge */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                
                {/* Feet (Optional aesthetic detail) */}
                <div className="absolute -bottom-2 left-8 w-12 h-4 bg-black/40 rounded-full blur-md"></div>
                <div className="absolute -bottom-2 right-8 w-12 h-4 bg-black/40 rounded-full blur-md"></div>
            </div>
        </div>
        
        {/* Floor Shadow */}
        <div className="absolute -bottom-4 left-4 right-4 h-8 bg-black/60 blur-xl rounded-[100%] z-[-1]"></div>
    </div>
  );
};

export default Board;