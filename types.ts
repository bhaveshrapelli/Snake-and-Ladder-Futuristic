
export type PlayerId = 1 | 2;

export interface Player {
  id: PlayerId;
  name: string;
  position: number; // 1 to 100
  color: string;
  avatar: string;
}

export interface GameEvent {
  type: 'LADDER' | 'SNAKE' | 'NORMAL' | 'WIN' | 'START';
  from: number;
  to: number;
  message: string;
  timestamp: number;
}

export interface BoardConnection {
  start: number;
  end: number;
  type: 'LADDER' | 'SNAKE';
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number;
  isRolling: boolean;
  winner: Player | null;
  history: GameEvent[];
  aiCommentary: string;
}
