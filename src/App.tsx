import { useState } from 'react';
import { BoardProvider } from './context/BoardContext';
import Lobby from './components/Lobby';
import Controls from './components/Controls';
import Board from './components/Board';

export default function App() {
  const [joined, setJoined] = useState<{ roomId: string; nickname: string } | null>(null);

  return (
    <BoardProvider>
      <div style={{ padding:16, fontFamily:'system-ui, Arial' }}>
        <h1>ICQ RPS Game</h1>
        {!joined ? (
          <Lobby onJoined={(roomId, nickname) => setJoined({ roomId, nickname })} />
        ) : (
          <>
            <div>Room: <strong>{joined.roomId}</strong> | You: <strong>{joined.nickname}</strong></div>
            <Controls />
            <p>Click a piece square (your side), then click a target square (one step). Same-type battle triggers a popup.</p>
            <Board />
          </>
        )}
      </div>
    </BoardProvider>
  );
}
