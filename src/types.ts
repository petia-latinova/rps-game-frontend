export type RpsChoice = 'rock' | 'paper' | 'scissors';

export interface Piece {
  id: string;
  owner: string; // playerId / socket.id
  type: 'rock' | 'paper' | 'scissors' | 'flag' | 'hole';
  revealedTo: string[]; // array of playerIds who can see it
}

export interface ServerCell {
  r: number;
  c: number;
  pieceId?: string;
}

export interface ServerState {
  id: string;
  size: { rows: number; cols: number };
  board: ServerCell[][];
  pieces: Record<string, Piece>; // <-- added pieces map
  turn: string | null;
  winner: string | null;
  you: string; // <-- current player id
  rps: { waiting: boolean } | null;
}
