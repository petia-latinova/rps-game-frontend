import { socket } from '../socket';
import type { RpsChoice } from '../types';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function RpsModal({ visible, onClose }: Props) {
  if (!visible) return null;

  const choose = (c: RpsChoice) => {
    socket.emit('rps_choice', { choice: c });
    onClose();
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'center', justifyContent:'center'
    }}>
      <div style={{ background:'#fff', padding:20, borderRadius:8, minWidth:280 }}>
        <h3>Same-type battle! Choose:</h3>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={()=>choose('rock')}>Rock</button>
          <button onClick={()=>choose('paper')}>Paper</button>
          <button onClick={()=>choose('scissors')}>Scissors</button>
        </div>
      </div>
    </div>
  );
}
