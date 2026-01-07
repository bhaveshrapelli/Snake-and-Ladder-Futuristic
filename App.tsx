
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player, GameState, GameEvent, PlayerId } from './types';
import { CONNECTIONS, PLAYER_CONFIG, TOTAL_SQUARES, BOARD_SIZE } from './constants';
import { getGameCommentary } from './services/geminiService';
import Square from './components/Square';
import BoardLines from './components/BoardLines';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: PLAYER_CONFIG.map(p => ({ ...p, position: 1 })),
    currentPlayerIndex: 0,
    diceValue: 0,
    isRolling: false,
    winner: null,
    history: [{ type: 'START', from: 0, to: 1, message: 'Welcome to the Nexus.', timestamp: Date.now() }],
    aiCommentary: 'System Online. Prepare for synchronization.',
  });

  const boardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const movePlayer = useCallback(async (playerId: PlayerId, steps: number) => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const player = newPlayers.find(p => p.id === playerId);
      if (!player) return prev;

      let newPos = player.position + steps;
      if (newPos > TOTAL_SQUARES) {
        // Bounce back logic or just stay put? Standard: stay put
        return { ...prev, isRolling: false, diceValue: steps };
      }

      player.position = newPos;

      // Check connections
      const connection = CONNECTIONS.find(c => c.start === newPos);
      let eventType: GameEvent['type'] = 'NORMAL';
      let oldPos = newPos;

      if (connection) {
        player.position = connection.end;
        eventType = connection.type;
        newPos = connection.end;
      }

      if (newPos === TOTAL_SQUARES) {
        eventType = 'WIN';
      }

      const event: GameEvent = {
        type: eventType,
        from: oldPos - steps,
        to: newPos,
        message: `${player.name} moved to ${newPos}`,
        timestamp: Date.now(),
      };

      // Create new state update
      const nextPlayerIndex = eventType === 'WIN' ? prev.currentPlayerIndex : (prev.currentPlayerIndex + 1) % prev.players.length;

      // Handle async side effects outside state update if possible
      // but we'll use a local variable to update commentary
      
      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        isRolling: false,
        diceValue: steps,
        winner: eventType === 'WIN' ? player : null,
        history: [...prev.history, event],
      };
    });
  }, []);

  // Update commentary whenever history changes
  useEffect(() => {
    const lastEvent = gameState.history[gameState.history.length - 1];
    if (lastEvent && lastEvent.type !== 'START') {
      const player = gameState.players[gameState.currentPlayerIndex === 0 ? 1 : 0]; // Player who just moved
      getGameCommentary(lastEvent, player.name).then(comment => {
        setGameState(prev => ({ ...prev, aiCommentary: comment }));
      });
    }
  }, [gameState.history.length]);

  const rollDice = () => {
    if (gameState.isRolling || gameState.winner) return;

    setGameState(prev => ({ ...prev, isRolling: true }));

    // Simulate dice animation
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      movePlayer(gameState.players[gameState.currentPlayerIndex].id, roll);
    }, 800);
  };

  const resetGame = () => {
    setGameState({
      players: PLAYER_CONFIG.map(p => ({ ...p, position: 1 })),
      currentPlayerIndex: 0,
      diceValue: 0,
      isRolling: false,
      winner: null,
      history: [{ type: 'START', from: 0, to: 1, message: 'Grid Reset.', timestamp: Date.now() }],
      aiCommentary: 'System reboot complete. Begin Phase 1.',
    });
  };

  const renderBoard = () => {
    const squares = [];
    // Board is 10x10. Square 100 at top, 1 at bottom.
    // Row 9 (top): 91-100
    // Row 0 (bottom): 1-10
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const row = r;
        let col = c;
        
        // Zigzag logic
        if (row % 2 === 1) {
          col = (BOARD_SIZE - 1) - c;
        }
        
        const squareNum = row * BOARD_SIZE + col + 1;
        const occupyingPlayers = gameState.players
          .filter(p => p.position === squareNum)
          .map(p => p.color);
          
        squares.push(
          <Square key={squareNum} number={squareNum} isOccupiedBy={occupyingPlayers} />
        );
      }
    }
    return squares;
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center bg-slate-950 text-cyan-50">
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Player Info & Stats */}
        <aside className="lg:col-span-3 space-y-4 order-2 lg:order-1">
          <div className="p-4 bg-slate-900/50 border border-cyan-500/20 rounded-xl space-y-4 neon-border">
            <h2 className="text-lg font-orbitron border-b border-cyan-500/20 pb-2">Active Pilots</h2>
            {gameState.players.map((p, idx) => (
              <div 
                key={p.id} 
                className={`p-3 rounded-lg flex items-center gap-3 border transition-all ${
                  gameState.currentPlayerIndex === idx 
                    ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-105' 
                    : 'bg-slate-800/40 border-transparent opacity-60'
                }`}
              >
                <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full border border-cyan-500" />
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-bold truncate">{p.name}</div>
                  <div className="text-[10px] text-cyan-400/70 font-orbitron">SQUARE: {p.position}</div>
                </div>
                {gameState.currentPlayerIndex === idx && (
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-900/50 border border-purple-500/20 rounded-xl space-y-2">
            <h2 className="text-xs font-orbitron text-purple-400 uppercase">AI Commentary</h2>
            <p className="text-sm leading-relaxed italic text-slate-300">
              "{gameState.aiCommentary}"
            </p>
          </div>
        </aside>

        {/* Center: The Board */}
        <main className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
          <div 
            ref={boardRef}
            className="relative w-full aspect-square bg-slate-900 border-2 border-cyan-500/40 rounded-sm grid grid-cols-10 overflow-hidden shadow-2xl"
          >
            {renderBoard()}
            <BoardLines containerRef={boardRef} />
          </div>

          {/* Winner Overlay */}
          {gameState.winner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
              <div className="text-center p-8 border-2 border-cyan-500 bg-slate-900 rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.5)]">
                <h2 className="text-5xl font-orbitron text-cyan-400 mb-4">VICTORY</h2>
                <img src={gameState.winner.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400" />
                <p className="text-xl mb-6">{gameState.winner.name} has breached the Nexus!</p>
                <button 
                  onClick={resetGame}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full transition-all"
                >
                  REBOOT SYSTEM
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar: Controls & Log */}
        <aside className="lg:col-span-3 space-y-4 order-3">
          <div className="p-6 bg-slate-900/50 border border-cyan-500/20 rounded-xl flex flex-col items-center gap-6 neon-border">
            <div className="text-center">
              <div className="text-xs font-orbitron text-cyan-400/60 uppercase mb-2">Quantun Multiplier</div>
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-cyan-500 flex items-center justify-center text-4xl md:text-5xl font-orbitron bg-slate-900 shadow-inner ${gameState.isRolling ? 'animate-bounce' : ''}`}>
                {gameState.isRolling ? '?' : gameState.diceValue || '0'}
              </div>
            </div>

            <button 
              disabled={gameState.isRolling || !!gameState.winner}
              onClick={rollDice}
              className={`w-full py-4 rounded-xl font-orbitron tracking-widest text-lg transition-all ${
                gameState.isRolling || !!gameState.winner
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
              }`}
            >
              {gameState.isRolling ? 'SYNCING...' : 'INITIATE MOVE'}
            </button>

            <div className="w-full text-center">
              <p className="text-xs text-slate-400 uppercase font-orbitron">Current Turn</p>
              <p className="text-sm font-bold text-cyan-400 uppercase">{currentPlayer.name}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl h-[300px] flex flex-col">
            <h2 className="text-xs font-orbitron text-slate-500 mb-2 uppercase">Protocol Logs</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-[10px] md:text-xs">
              {[...gameState.history].reverse().map((event, i) => (
                <div key={i} className="flex gap-2 p-2 rounded bg-slate-800/30 border-l-2 border-cyan-500/40">
                  <span className="text-cyan-500/60 font-mono">[{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  <span className="text-slate-300">{event.message}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="mt-8 text-slate-600 text-[10px] uppercase font-orbitron tracking-widest">
        Nexus-Grid Interface Layer © 2099 Void-Tech Industries
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
