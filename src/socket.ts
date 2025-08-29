import { io } from 'socket.io-client';

export const socket = io('http://localhost:4000', { autoConnect: true });

socket.on('connect', () => console.log('[Socket] connected', socket.id));
socket.on('disconnect', () => console.log('[Socket] disconnected'));
socket.on('error_msg', (e) => console.warn('[Socket] error:', e));
