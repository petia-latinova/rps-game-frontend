import { useMemo } from 'react';
import { socket } from '../socket';
import { useBoard } from '../context/BoardContext';

export default function Controls() {
  const { serverState } = useBoard();

  // Track remaining pieces to place
  const piecesRemaining = useMemo(() => {
    if (!serverState) {
      return
    }
    const totalPieces = {
      flag: 1,
      hole: 1,
    };

    Object.values(serverState.pieces).forEach(piece => {
      if (piece.owner === serverState.you && totalPieces[piece.type as keyof typeof totalPieces] > 0) {
        totalPieces[piece.type as keyof typeof totalPieces]--;
      }
    });

    return totalPieces;
  }, [serverState]);

  // If state is not ready, don't render extra controls
  if (!serverState) {
    return (
      <div style={{ display: 'flex', gap: 12, margin: '8px 0' }}>
        <button onClick={() => socket.emit('ready', { ready: true })}>Ready</button>
        <button onClick={() => socket.emit('get_state')}>Refresh</button>
      </div>
    );
  }

  const totalPlaced = Object.values(serverState.pieces)
    .filter(p => p.owner === serverState.you).length;

  const allPlaced = totalPlaced === 14;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => socket.emit('ready', { ready: true })}
          disabled={!allPlaced}
        >
          Ready
        </button>
        <button onClick={() => socket.emit('get_state')}>Refresh</button>
        <button
          onClick={() => socket.emit('randomize')}
          disabled={!serverState.myFlagPlaced || !serverState.myHolePlaced}
        >
          Randomize
        </button>
      </div>

      {/* Display how many pieces remain */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {Object.entries(piecesRemaining).map(([type, count]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>
              {type === 'rock' ? '🪨' :
               type === 'paper' ? '📄' :
               type === 'scissors' ? '✂️' :
               type === 'flag' ? '🚩' :
               type === 'hole' ? '🕳️' : '🧍'}
            </span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>

      {/* Info about turn and state */}
      <div style={{ marginTop: 8 }}>
        <strong>Status:</strong>{' '}
        {allPlaced
          ? (serverState.turn
              ? serverState.turn === serverState.you
                ? 'Your turn'
                : 'Opponent turn'
              : 'Waiting for opponent to be ready')
          : 'Place your pieces'}
      </div>
    </div>
  );
}

