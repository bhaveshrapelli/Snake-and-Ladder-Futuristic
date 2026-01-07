
import { BoardConnection } from './types';

export const BOARD_SIZE = 10;
export const TOTAL_SQUARES = 100;

// Positive numbers are Ladders (Hyper-Loops), negative or lower are Snakes (Neural De-syncs)
export const CONNECTIONS: BoardConnection[] = [
  // Hyper-Loops (Ladders)
  { start: 2, end: 38, type: 'LADDER' },
  { start: 7, end: 14, type: 'LADDER' },
  { start: 8, end: 31, type: 'LADDER' },
  { start: 15, end: 26, type: 'LADDER' },
  { start: 21, end: 42, type: 'LADDER' },
  { start: 28, end: 84, type: 'LADDER' },
  { start: 36, end: 44, type: 'LADDER' },
  { start: 51, end: 67, type: 'LADDER' },
  { start: 71, end: 91, type: 'LADDER' },
  { start: 78, end: 98, type: 'LADDER' },
  { start: 87, end: 94, type: 'LADDER' },

  // Neural De-syncs (Snakes)
  { start: 16, end: 6, type: 'SNAKE' },
  { start: 46, end: 25, type: 'SNAKE' },
  { start: 49, end: 11, type: 'SNAKE' },
  { start: 62, end: 19, type: 'SNAKE' },
  { start: 64, end: 60, type: 'SNAKE' },
  { start: 74, end: 53, type: 'SNAKE' },
  { start: 89, end: 68, type: 'SNAKE' },
  { start: 92, end: 88, type: 'SNAKE' },
  { start: 95, end: 75, type: 'SNAKE' },
  { start: 99, end: 80, type: 'SNAKE' },
];

export const PLAYER_CONFIG = [
  { id: 1 as const, name: 'Cyber-Punker', color: '#22d3ee', avatar: 'https://picsum.photos/seed/cyber1/100/100' },
  { id: 2 as const, name: 'Void-Runner', color: '#c084fc', avatar: 'https://picsum.photos/seed/cyber2/100/100' },
];
