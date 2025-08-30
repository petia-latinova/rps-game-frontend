import { useEffect, useMemo, useState } from 'react';
import { socket } from '../socket';
import { useBoard } from '../context/BoardContext';
import RpsModal from './RpsModal';

import type { Cell, Board } from '../types.ts';
import type { ServerState, ServerCell } from '../types';

type Sel = { r:number; c:number } | null;

export default function Board() {
  const { board, setBoard } = useBoard();
  const [serverState, setServerState] = useState<ServerState | null>(null);
  const [selected, setSelected] = useState<Sel>(null);
  const [showRps, setShowRps] = useState(false);
  const [myPiecesPlaced, setMyPiecesPlaced] = useState(0);

  useEffect(() => {
  socket.on('state', (s: ServerState) => {
    console.log('[FE] state', s);
    setServerState(s);
    setShowRps(!!s.rps);

    // Map serverState to BoardContext
    const mapped = s.board.map((row, rIdx) =>
      row.map((cell: ServerCell, cIdx) => {
        let type: Cell['type'] = null;
        let revealed = false;
        let owner = '';

        // If the cell has a piece, look it up in the pieces map
        if (cell.pieceId && s.pieces[cell.pieceId]) {
          const piece = s.pieces[cell.pieceId];
          revealed = piece.revealedTo.includes(s.you); // 's.you' = your playerId
          type = revealed ? piece.type : null;
          owner = piece.owner;
        }

        return {
          id: `${rIdx}-${cIdx}`,
          type,
          revealed,
          owner,
        };
      })
    );
      // Clone rows to ensure React re-renders
      setBoard(mapped.map(row => [...row]));

      // Track how many pieces the player has placed //TODO
    if (typeof s.myPiecesPlaced === 'number') {
      setMyPiecesPlaced(s.myPiecesPlaced);
    }
  });

  socket.emit('get_state');

  return () => socket.off('state');
}, [setBoard]);

  console.log('Board rows:', board.length, 'Cols:', board[0]?.length);

  const turnInfo = useMemo(() => {
    if (!serverState) return '—';
    return serverState.turn ? `Turn: ${serverState.turn.slice(0,5)}…` : 'Waiting for ready';
  }, [serverState]);

  function oponentColor(color: string | undefined) {
    switch (color) {
      case 'red': return 'blue';
      case 'blue': return 'red';
      default: return '';
    }
  }

  function getColor(color: string | undefined) {
    switch(color) {
      case 'red': return '🔴';
      case 'blue': return '🔵';
      default: return '';
    }
  }

  function symbol(cell: Cell) {
    const color = serverState?.you === cell.owner ? serverState?.color : oponentColor(serverState?.color);
    switch (cell.type) {
      case 'rock': return `${getColor(color)}🪨`;
      case 'paper': return `${getColor(color)}📄`;
      case 'scissors': return `${getColor(color)}✂️`;
      case 'flag': return `${getColor(color)}🚩`;
      case 'hole': return `${getColor(color)}🕳️`;
      case 'person': return `${getColor(color)}🧍`;
      default: return '';
    }
  }

  function cellClick(r: number, c: number) {
    if (!serverState || serverState.winner) {
      return;
    }

    const cell = board[r][c];

    // === Placement phase: first 2 pieces (flag & hole) ===
    // Track locally which piece is being placed
    const placedFlag = serverState.myFlagPlaced; // boolean sent from backend
    const placedHole = serverState.myHolePlaced; // boolean sent from backend

    if (!placedFlag || !placedHole) {
      // Only allow empty cells
      if (cell.revealed || cell.type) return;

      // Determine which piece to place visually
      const pieceType: 'flag' | 'hole' = !placedFlag ? 'flag' : 'hole';

      // Temporarily show the piece locally (frontend only)
      setBoard((prev) => {
        const newBoard = prev.map((row, rIdx) =>
          row.map((cCell, cIdx) => {
            if (rIdx === r && cIdx === c) {
              return { ...cCell, type: pieceType, revealed: true };
            }
            return cCell;
          })
        );
        return newBoard;
      });

      // Notify backend of placement
      socket.emit('place_piece', { r, c, type: pieceType });
      return;
    }

    // === Movement phase ===
    if (!selected) {
      if (!cell.type || !cell.revealed) return; // can only select your own visible pieces
      setSelected({ r, c });
    } else {
      if (selected.r === r && selected.c === c) {
        setSelected(null);
        return;
      }

      // Move only 1 step orthogonally
      const dr = Math.abs(selected.r - r);
      const dc = Math.abs(selected.c - c);
      if (!((dr === 1 && dc === 0) || (dr === 0 && dc === 1))) {
        console.warn('Invalid move: must be 1 tile orthogonally');
        return;
      }

      socket.emit('move', { from: selected, to: { r, c } });
      setSelected(null);
    }
}

  const winner = serverState?.winner;

  return (
    <div>
      <div style={{ margin: '8px 0' }}>
        <strong>{turnInfo}</strong>{' '}
        {winner && <span> | Winner: {winner.slice(0, 5)}… 🎉</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {board.map((row, r) => (
          <div
            key={`row-${r}`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 52px)', // 7 columns
              gap: 4,
            }}
          >
            {row.map((cell, c) => {
              const isSel = selected && selected.r === r && selected.c === c;
              return (
                <div
                  key={`${r}-${c}`} // unique key for each cell
                  onClick={() => cellClick(r, c)}
                  style={{
                    width: 52,
                    height: 52,
                    border: '1px solid #222',
                    background: isSel ? '#ffd' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  title={`${r},${c}`}
                >
                  {cell.revealed ? symbol(cell) : cell.type ? '?' : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <RpsModal visible={showRps} onClose={() => setShowRps(false)} />
    </div>
  );
}
