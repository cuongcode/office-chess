import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import {
    createRoom,
    joinRoom,
    joinRoomAsPlayer,
    joinRoomAsSpectator,
    leaveRoom,
    updateGameState,
    getRoom,
    handleDisconnect,
    Player,
    GameRoom
} from './gameRooms';

export const initSocketServer = (httpServer: NetServer) => {
    const io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: '*', // Adjust for production
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('create_game', (data: { userId: string; userName: string; colorPreference?: 'white' | 'black' | 'random' }) => {
            const player: Player = {
                id: data.userId,
                name: data.userName,
                socketId: socket.id
            };

            const { room, color } = createRoom(player, data.colorPreference || 'random');
            socket.join(room.roomId);

            socket.emit('game_created', {
                roomId: room.roomId,
                color: color,
                gameState: room.gameState
            });
        });

        socket.on('join_game', (data: { roomId: string; userId: string; userName: string }) => {
            const player: Player = {
                id: data.userId,
                name: data.userName,
                socketId: socket.id
            };

            const result = joinRoomAsPlayer(data.roomId, player);

            if (!result) {
                socket.emit('game_error', { message: 'Cannot join as player - room is full or not found' });
                return;
            }

            const { room, role } = result;
            socket.join(room.roomId);

            // Notify the joiner
            socket.emit('game_joined', {
                roomId: room.roomId,
                color: role,
                gameState: room.gameState,
                whitePlayer: room.whitePlayer,
                blackPlayer: room.blackPlayer,
                spectatorCount: room.spectators.length
            });

            // Notify everyone in the room
            io.to(room.roomId).emit('player_joined', {
                role,
                player,
                whitePlayer: room.whitePlayer,
                blackPlayer: room.blackPlayer,
                spectatorCount: room.spectators.length
            });

            // If both players are present, start game (or just notify readiness)
            if (room.whitePlayer && room.blackPlayer && room.gameState.status === 'playing') {
                io.to(room.roomId).emit('game_ready', {
                    whitePlayer: room.whitePlayer,
                    blackPlayer: room.blackPlayer
                });
            }
        });

        socket.on('spectate_game', (data: { roomId: string; userId: string; userName: string }) => {
            const player: Player = {
                id: data.userId,
                name: data.userName,
                socketId: socket.id
            };

            const result = joinRoomAsSpectator(data.roomId, player);

            if (!result) {
                socket.emit('game_error', { message: 'Room not found' });
                return;
            }

            const { room, role } = result;
            socket.join(room.roomId);

            // Notify the joiner
            socket.emit('game_joined', {
                roomId: room.roomId,
                color: role,
                gameState: room.gameState,
                whitePlayer: room.whitePlayer,
                blackPlayer: room.blackPlayer,
                spectatorCount: room.spectators.length
            });

            // Notify everyone in the room about new spectator
            io.to(room.roomId).emit('spectator_joined', {
                count: room.spectators.length
            });
        });

        socket.on('make_move', (data: { roomId: string; move: any; gameState: any }) => {
            // Allow client to calculate state for responsiveness, but verification should happen here usually.
            // For this step, we trust the client's validated move and update state.
            // In a stricter app, re-validate with chess.js here.

            const updatedRoom = updateGameState(data.roomId, data.gameState);

            if (updatedRoom) {
                socket.to(data.roomId).emit('move_made', {
                    move: data.move,
                    gameState: updatedRoom.gameState
                });
            }
        });

        socket.on('leave_game', (data: { roomId: string }) => {
            const result = leaveRoom(data.roomId, socket.id);
            socket.leave(data.roomId);

            if (result.room) {
                io.to(data.roomId).emit('player_left', {
                    socketId: socket.id
                });

                // Notify about spectator count change
                io.to(data.roomId).emit('spectator_left', {
                    count: result.room.spectators.length
                });

                // If a player left (resigned), emit game over
                if (result.resignedColor) {
                    const winner = result.resignedColor === 'white' ? 'black' : 'white';
                    io.to(data.roomId).emit('game_over', {
                        result: winner,
                        reason: 'resignation',
                        gameState: result.room.gameState
                    });
                }

                // If room still exists, send update
                io.to(data.roomId).emit('room_updated', result.room);
            }
        });

        socket.on('offer_draw', (data: { roomId: string, color: 'white' | 'black' }) => {
            socket.to(data.roomId).emit('draw_offered', { color: data.color });
        });

        socket.on('respond_draw', (data: { roomId: string; accept: boolean }) => {
            if (data.accept) {
                const room = getRoom(data.roomId);
                if (room) {
                    room.gameState.status = 'draw';
                    room.gameState.winner = 'draw';
                    io.to(data.roomId).emit('game_over', {
                        result: 'draw',
                        reason: 'agreement',
                        gameState: room.gameState
                    });
                }
            } else {
                socket.to(data.roomId).emit('draw_declined');
            }
        });

        socket.on('resign', (data: { roomId: string; color: 'white' | 'black' }) => {
            const room = getRoom(data.roomId);
            if (room) {
                const winner = data.color === 'white' ? 'black' : 'white';
                room.gameState.status = 'resignation';
                room.gameState.winner = winner;
                io.to(data.roomId).emit('game_over', {
                    result: winner,
                    reason: 'resignation',
                    gameState: room.gameState
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const room = handleDisconnect(socket.id);

            if (room) {
                // If a room was returned, it means this socket was involved (likely spectator removed)
                io.to(room.roomId).emit('spectator_left', {
                    count: room.spectators.length
                });
            }
        });
    });

    return io;
};
