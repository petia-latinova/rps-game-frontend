import { useEffect } from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { socket } from './socket';

const Board = () => {
  const { board } = useBoard();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 50px)', gap: 5 }}>
      {board.flat().map((cell, index) => (
        <div
          key={index}
          style={{
            width: 50,
            height: 50,
            border: '1px solid black',
            backgroundColor: cell.revealed ? 'lightgray' : 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {cell.revealed ? cell.type : ''}
        </div>
      ))}
    </div>
  );
};

const AppInner = () => {
  useEffect(() => {
    socket.on('pong', (msg) => console.log('Received from server:', msg));
    socket.emit('ping', 'Hello server');
    return () => {
      socket.off('pong');
    };
  }, []);

  return <Board />;
};

const App = () => (
  <BoardProvider>
    <AppInner />
  </BoardProvider>
);

export default App;
