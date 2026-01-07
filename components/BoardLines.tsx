
import React from 'react';
import { CONNECTIONS, BOARD_SIZE } from '../constants';

interface BoardLinesProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const BoardLines: React.FC<BoardLinesProps> = ({ containerRef }) => {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef]);

  const getCoordinates = (pos: number) => {
    const zeroBased = pos - 1;
    const row = Math.floor(zeroBased / BOARD_SIZE);
    let col = zeroBased % BOARD_SIZE;
    
    // Zigzag logic
    if (row % 2 === 1) {
      col = (BOARD_SIZE - 1) - col;
    }

    const cellWidth = dimensions.width / BOARD_SIZE;
    const cellHeight = dimensions.height / BOARD_SIZE;

    // y starts from bottom
    return {
      x: col * cellWidth + cellWidth / 2,
      y: dimensions.height - (row * cellHeight + cellHeight / 2),
    };
  };

  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      width={dimensions.width} 
      height={dimensions.height}
    >
      <defs>
        <linearGradient id="ladderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {CONNECTIONS.map((conn, i) => {
        const start = getCoordinates(conn.start);
        const end = getCoordinates(conn.end);
        const isLadder = conn.type === 'LADDER';
        
        return (
          <g key={i} className="opacity-40">
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={isLadder ? "url(#ladderGrad)" : "url(#snakeGrad)"}
              strokeWidth={isLadder ? "4" : "3"}
              strokeDasharray={isLadder ? "none" : "8,4"}
              className={isLadder ? "" : "animate-[dash_2s_linear_infinite]"}
            />
            {/* Endpoints indicators */}
            <circle cx={start.x} cy={start.y} r="4" fill={isLadder ? "#22d3ee" : "#f43f5e"} />
            <circle cx={end.x} cy={end.y} r="4" fill={isLadder ? "#22d3ee" : "#f43f5e"} />
          </g>
        );
      })}
      
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -24; }
        }
      `}</style>
    </svg>
  );
};

export default BoardLines;
