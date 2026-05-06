export interface Player {
  id: string;
  name: string;
}

export interface GamePlayer extends Player {
  buyIn: number;
  remainingChips?: number;
  netProfit?: number;
}

export interface Game {
  id: string;
  date: string;
  players: GamePlayer[];
  status: 'active' | 'settled';
}

export type View = 'roster' | 'setup' | 'playing' | 'settlement' | 'history';
