import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';

import { initSocketServer } from '@/lib/socket-server';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: any) => {
    if (!res.socket.server.io) {
        console.log('*First use, starting socket.io');
        const httpServer: NetServer = res.socket.server as any;
        const io = initSocketServer(httpServer);
        res.socket.server.io = io;
    } else {
        console.log('Socket.io already running');
    }

    res.end();
};

export default ioHandler;
