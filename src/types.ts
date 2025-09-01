// === Shared types ===
export type RpsChoice = 'rock' | 'paper' | 'scissors';

export type PieceType = 'rock' | 'paper' | 'scissors' | 'flag' | 'hole' | 'person';

export interface Piece {
  id: string;
  owner: string; // playerId / socket.id
  type: PieceType;
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
  pieces: Record<string, Piece>; // added pieces map
  turn: string | null;
  winner: string | null;
  you: string; // current player id
  color: string;
  rps: { waiting: boolean } | null;
  myPiecesPlaced?: number;
  myFlagPlaced: boolean;
  myHolePlaced: boolean;
  playerColors?: Record<string, 'red' | 'blue'>;
}


// === Frontend context types ===
export type Cell = {
  id: string;
  type: PieceType | null;
  revealed: boolean;
  owner?: string;
};

export type Board = Cell[][];

export type BoardContextType = {
  board: Board;
  setBoard: React.Dispatch<React.SetStateAction<Board>>;
  serverState: ServerState | null;
  setServerState: React.Dispatch<React.SetStateAction<ServerState | null>>;
};
