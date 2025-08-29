import { useState } from 'react';
import { socket } from '../socket';

type Props {
  socket: any;
}

function NicknamePrompt({ socket }: NicknamePromptProps) {
  const [nickname, setNickname] = useState('');  
  const [confirmed, setConfirmed] = useState(false);

const handleSubmit() = () => {
  if(!nickname.trim()) {
    return;
  }
  console.log('[FE] Sending nickname', nickname);
  socket.emit('set_nickname', { nickname });
  socket.on('nickname_ack', (data: any) => {
    console.log('[FE] Nickname acknowledged by server', data);
    setConfirmed(true);
  });
};

  return(
    <>
      {!confirmed ? (
        <>
          <input
            type="text"
            placeholder="Enter nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={handleSubmit}>Join</button>
        </>
      ) : (
        <p>Welcome, {nickname}!</p>
      )}
    </>
  );
}

export default NicknamePrompt;