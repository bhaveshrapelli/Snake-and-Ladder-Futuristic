
import React from 'react';

interface SquareProps {
  number: number;
  isOccupiedBy: string[]; // Player colors
}

const Square: React.FC<SquareProps> = ({ number, isOccupiedBy }) => {
  return (
    <div className="relative w-full aspect-square border border-cyan-500/20 bg-slate-900/40 flex items-center justify-center cell-glow group transition-all">
      <span className="absolute top-1 left-1 text-[10px] md:text-xs font-orbitron text-cyan-500/40 group-hover:text-cyan-400">
        {number}
      </span>
      
      <div className="flex flex-wrap gap-1 items-center justify-center p-1">
        {isOccupiedBy.map((color, idx) => (
          <div
            key={idx}
            className="w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-white shadow-lg animate-bounce"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Square;
