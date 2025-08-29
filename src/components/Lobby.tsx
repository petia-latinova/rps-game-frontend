import { useEffect, useState } from 'react';
import { socket } from '../socket';

type Props = {
  onJoined: (roomId: string, nickname: string) => void;
};

export default function Lobby({ onJoined }: Props) {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [ack, setAck] = useState(false);

  useEffect(() => {
    socket.on('nickname_ack', (d) => {
      console.log('[FE] nickname ack', d);
      setAck(true);
    });
    socket.on('room_joined', ({ roomId }) => {
      console.log('[FE] joined room', roomId);
      onJoined(roomId, nickname);
    });
    return () => {
      socket.off('nickname_ack');
      socket.off('room_joined');
    };
  }, [nickname, onJoined]);

  function sendNick() {
    if (!nickname.trim()) return;
    socket.emit('set_nickname', { nickname });
  }

  function createRoom() {
    if (!ack) return alert('Set nickname first');
    socket.emit('create_room');
  }

  function joinRoom() {
    if (!ack || !roomId.trim()) return alert('Nickname + Room ID required');
    socket.emit('join_room', { roomId });
  }

  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', margin:'16px 0' }}>
      <input placeholder="Nickname" value={nickname} onChange={e=>setNickname(e.target.value)} />
      <button onClick={sendNick}>Set Nickname</button>

      <button onClick={createRoom}>Create Room</button>

      <input placeholder="Room ID" value={roomId} onChange={e=>setRoomId(e.target.value)} />
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}

