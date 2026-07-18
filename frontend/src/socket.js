import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

function createSocket(token) {
  return io(socketUrl, {
    transports: ['websocket'],
    auth: {
      token,
    },
  });
}

export { createSocket };