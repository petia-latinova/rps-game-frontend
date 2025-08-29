import { socket } from '../socket';

export default function Controls() {
  return (
    <div style={{ display:'flex', gap:12, margin:'8px 0' }}>
      <button onClick={() => socket.emit('ready', { ready: true })}>Ready</button>
      <button onClick={() => socket.emit('get_state')}>Refresh</button>
    </div>
  );
}
