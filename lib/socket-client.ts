import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';

        socket = io(backendUrl, {
            path: '/api/socket',
            addTrailingSlash: false,
        });
    }
    return socket;
};
