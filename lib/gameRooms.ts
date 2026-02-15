export interface Player {
    id: string;
    name: string;
    socketId: string;
}

export interface GameState {
    fen: string;
    moveHistory: string[];
    turn: 'w' | 'b';
    status: 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'resignation' | 'check';
    winner?: 'white' | 'black' | 'draw';
}

export interface GameRoom {
    roomId: string;
    whitePlayer: Player | null;
    blackPlayer: Player | null;
    spectators: Player[];
    gameState: GameState;
    createdAt: Date;
    drawOffer?: 'white' | 'black'; // Color that offered the draw
}

// In-memory storage for game rooms
// In-memory storage for game rooms
// Note: In a production app with multiple server instances, this should be in Redis
// We use globalThis to ensure the map is shared between the Socket.IO server execution context
// and the Next.js API route execution context in development.

declare global {
    var socketGameRooms: Map<string, GameRoom> | undefined;
}

const gameRooms = globalThis.socketGameRooms || new Map<string, GameRoom>();

if (process.env.NODE_ENV !== 'production') {
    globalThis.socketGameRooms = gameRooms;
}

// Helper to generate a random room ID
export const generateRoomId = (): string => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const createRoom = (creator: Player): GameRoom => {
    let roomId = generateRoomId();
    while (gameRooms.has(roomId)) {
        roomId = generateRoomId();
    }

    const newRoom: GameRoom = {
        roomId,
        whitePlayer: creator, // Creator is always white by default
        blackPlayer: null,
        spectators: [],
        gameState: {
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Start position
            moveHistory: [],
            turn: 'w',
            status: 'playing',
        },
        createdAt: new Date(),
    };

    gameRooms.set(roomId, newRoom);
    return newRoom;
};

export const getRoom = (roomId: string): GameRoom | undefined => {
    return gameRooms.get(roomId);
};

export const getAllRooms = (): GameRoom[] => {
    const rooms = Array.from(gameRooms.values());
    console.log('getAllRooms:', rooms.length, 'rooms');
    return rooms;
};

export const joinRoom = (roomId: string, player: Player): { room: GameRoom; role: 'white' | 'black' | 'spectator' } | null => {
    const room = gameRooms.get(roomId);
    if (!room) return null;

    // Check if player is already in the room (reconnection)
    if (room.whitePlayer?.id === player.id) {
        room.whitePlayer.socketId = player.socketId; // Update socket ID
        return { room, role: 'white' };
    }
    if (room.blackPlayer?.id === player.id) {
        room.blackPlayer.socketId = player.socketId; // Update socket ID
        return { room, role: 'black' };
    }

    // Assign role
    if (!room.whitePlayer) {
        room.whitePlayer = player;
        return { room, role: 'white' };
    } else if (!room.blackPlayer) {
        room.blackPlayer = player;
        return { room, role: 'black' };
    } else {
        // Add to spectators if not already there
        if (!room.spectators.some(s => s.id === player.id)) {
            room.spectators.push(player);
        } else {
            // Update socket ID for existing spectator
            const spectator = room.spectators.find(s => s.id === player.id);
            if (spectator) spectator.socketId = player.socketId;
        }
        return { room, role: 'spectator' };
    }
};

export const leaveRoom = (roomId: string, socketId: string): GameRoom | null => {
    const room = gameRooms.get(roomId);
    if (!room) return null;

    // We don't remove white/black players on disconnect, just update their connection status (handled by client presence mostly)
    // For now, let's just remove from spectators.
    // Major player handling usually requires a 'disconnect' grace period or explicit 'leave' action.
    // Implicitly, if socket disconnects, we might want to mark them as offline but keep the slot.

    // If this is an explicit "leave game" action:
    if (room.whitePlayer?.socketId === socketId) {
        room.whitePlayer = null; // Open up the slot? Or forfeit?
        // Usually in chess, leaving means resigning or aborting. 
        // For simplicity in this v1: if a player leaves, the game might end or they forfeit.
        // Let's keep it simple: if a player explicitly leaves API-wise, they are removed.
    } else if (room.blackPlayer?.socketId === socketId) {
        room.blackPlayer = null;
    } else {
        room.spectators = room.spectators.filter(s => s.socketId !== socketId);
    }

    // If room is empty, delete it
    if (!room.whitePlayer && !room.blackPlayer && room.spectators.length === 0) {
        gameRooms.delete(roomId);
        return null; // Room deleted
    }

    return room;
};

// Handle socket disconnect (not explicit leave)
export const handleDisconnect = (socketId: string) => {
    // Find all rooms this socket is part of
    for (const [roomId, room] of gameRooms.entries()) {
        let changed = false;

        // We generally don't remove players on simple disconnect (refresh), 
        // but we might want to notify others.
        // For this implementation, let's just return the affected rooms so the server can notify.

        // Actually, we should probably remove spectators on disconnect
        const initialSpecCount = room.spectators.length;
        room.spectators = room.spectators.filter(s => s.socketId !== socketId);
        if (room.spectators.length !== initialSpecCount) changed = true;

        // We don't nullify players on disconnect to allow reconnection

        if (changed) return room;
    }
    return null;
};


export const updateGameState = (roomId: string, gameState: GameState): GameRoom | null => {
    const room = gameRooms.get(roomId);
    if (!room) return null;

    room.gameState = gameState;
    return room;
};

export const deleteRoom = (roomId: string) => {
    gameRooms.delete(roomId);
};
