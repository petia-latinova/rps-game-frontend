import { useEffect, useMemo, useState } from 'react';
import { socket } from '../socket';
import { useBoard } from '../context/BoardContext';
import RpsModal from './RpsModal';

import type { Cell } from '../context/BoardContext';
import type { ServerState, ServerCell } from '../types';

type Sel = { r:number; c:number } | null;

export default function Board() {
  const { board, setBoard } = useBoard();
  const [serverState, setServerState] = useState<ServerState | null>(null);
  const [selected, setSelected] = useState<Sel>(null);
  const [showRps, setShowRps] = useState(false);

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

        // If the cell has a piece, look it up in the pieces map
        if (cell.pieceId && s.pieces[cell.pieceId]) {
          const piece = s.pieces[cell.pieceId];
          revealed = piece.revealedTo.includes(s.you); // 's.you' = your playerId
          type = revealed ? piece.type : null;
        }

        return {
          id: `${rIdx}-${cIdx}`,
          type,
          revealed,
        };
      })
    );

    setBoard(mapped);
  });

  socket.emit('get_state');

  return () => socket.off('state');
}, [setBoard]);

  console.log('Board rows:', board.length, 'Cols:', board[0]?.length);

  const turnInfo = useMemo(() => {
    if (!serverState) return '—';
    return serverState.turn ? `Turn: ${serverState.turn.slice(0,5)}…` : 'Waiting for ready';
  }, [serverState]);

  function cellClick(r: number, c: number) {
    if (!serverState || serverState.winner) { 
      return;
    }
    if (!selected) {
      setSelected({ r, c });
    } else {
      if (selected.r === r && selected.c === c) {
        setSelected(null);
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
                  {cell.revealed ? symbol(cell.type) : cell.type ? '?' : ''}
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

function symbol(t: string | null | undefined) {
  switch (t) {
    case 'rock': return '🪨';
    case 'paper': return '📄';
    case 'scissors': return '✂️';
    case 'flag': return '🚩';
    case 'hole': return '🕳️';
    default: return '';
  }
}
