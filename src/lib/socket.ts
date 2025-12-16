import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const WS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getSocket(token: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(WS_URL, {
    transports: ['websocket'],
    auth: {
      token,
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return socket;
}


