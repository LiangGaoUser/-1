import React from 'react';
import { Player } from '../types';

interface StoneProps {
  player: Player;
  isLastMove?: boolean;
}

const Stone: React.FC<StoneProps> = ({ player, isLastMove }) => {
  if (player === Player.None) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none z-20">
      <div
        className={`
          w-[95%] h-[95%] rounded-full transition-transform duration-200 animate-in zoom-in-50
          ${player === Player.Black ? 'stone-black' : 'stone-white'}
        `}
      >
        {/* Last move indicator - Small red dot or contrasting mark */}
        {isLastMove && (
          <div 
            className={`
               absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full last-move-marker shadow-sm
               ${player === Player.Black ? 'bg-red-500 box-shadow-red' : 'bg-red-500'}
            `} 
          />
        )}
      </div>
    </div>
  );
};

export default Stone;