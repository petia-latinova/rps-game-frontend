import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Board, BoardContextType } from '../types.ts';

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
