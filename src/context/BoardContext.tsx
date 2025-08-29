import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Cell = {
  id: string;
  type: 'rock' | 'paper' | 'scissors' | 'flag' | 'hole' | null;
  revealed: boolean;
};

export type Board = Cell[][];

type BoardContextType = {
  board: Board;
  setBoard: React.Dispatch<React.SetStateAction<Board>>;
};

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [board, setBoard] = useState<Board>(
    Array(6).fill(Array(7).fill({ id: '', type: null, revealed: false }))
  );

  return (
    <BoardContext.Provider value={{ board, setBoard }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error('useBoard must be used inside BoardProvider');
  return context;
};
