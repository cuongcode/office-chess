import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import {
    createRoom,
    GameRoom,
    getRoom,
    handleDisconnect,
    joinRoom,
    joinRoomAsPlayer,
    joinRoomAsSpectator,
    leaveRoom,
    Player,
    updateGameState} from './gameRooms';
import { detectOpening, generatePGN, toDbResult,toPgnResult } from './pgn';
import { prisma } from './prisma';
import { updatePlayerStats } from './rating';
import { getTimeControlDisplay,TimeControlPreset } from './timeControls';

export const initSocketServer = (httpServer: NetServer) => {
    const io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: '*', // Adjust for production
            methods: ['GET', 'POST']
        }
    });

    // Store timer intervals for each room
    const roomTimerIntervals = new Map<string, NodeJS.Timeout>();

    // ---------------------------------------------------------------------------
    // saveGame — persist a completed game to the database
    // ---------------------------------------------------------------------------
    const saveGame = async (
        room: GameRoom,
        result: 'white' | 'black' | 'draw' | string,
        reason: string
    ): Promise<string | null> => {
        if (!room.whitePlayer || !room.blackPlayer) return null;

        try {
            const moves = room.gameState.moveHistory ?? [];
            const endedAt = new Date();
            const startedAt = room.gameStartedAt ? new Date(room.gameStartedAt) : room.createdAt;
            const durationSec = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

            // Time control string e.g. "3+2" or "unlimited"
            const timeControlStr = room.timeControl
                ? getTimeControlDisplay(room.timeControl)
                : 'unlimited';

            // Map result/reason to DB columns
            const { result: dbResult, resultMethod } = toDbResult(result, reason);

            // PGN result token
            const pgnResult = toPgnResult(result);

            // Generate PGN
            const pgn = generatePGN({
                whitePlayerName: room.whitePlayer.name,
                blackPlayerName: room.blackPlayer.name,
                moves,
                result: pgnResult,
                date: startedAt,
                timeControl: timeControlStr,
            });

            // Detect opening from first 10 moves
            const opening = detectOpening(moves.slice(0, 10));

            const saved = await prisma.game.create({
                data: {
                    whitePlayerId: room.whitePlayer.id,
                    blackPlayerId: room.blackPlayer.id,
                    result: dbResult,
                    resultMethod,
                    movesPGN: pgn,
                    movesArray: moves,
                    finalPosition: room.gameState.fen,
                    moveCount: moves.length,
                    timeControl: timeControlStr,
                    whiteTimeLeft: room.timeControl ? Math.round(room.whiteTimeLeft) : null,
                    blackTimeLeft: room.timeControl ? Math.round(room.blackTimeLeft) : null,
                    duration: durationSec,
                    opening,
                    endedAt,
                },
            });

            console.log(`[Server] Game saved: ${saved.id} | result: ${dbResult} | method: ${resultMethod}`);
            return saved.id;
        } catch (err) {
            console.error('[Server] Failed to save game:', err);
            return null;
        }
    };

    // Helper function to start timer sync for a room
    const startTimerSync = (roomId: string) => {
        // Clear existing interval if any
        const existingInterval = roomTimerIntervals.get(roomId);
        if (existingInterval) {
            clearInterval(existingInterval);
        }

        // Start new interval to broadcast timer state every second
        const interval = setInterval(() => {
            const room = getRoom(roomId);
            if (!room || !room.timeControl || room.timeControl.category === 'unlimited') {
                return;
            }

            // Calculate current time based on elapsed time
            if (room.activeTimerColor && room.timerStartedAt) {
                const now = Date.now();
                const elapsed = (now - room.lastTimerUpdate) / 1000;

                if (room.activeTimerColor === 'white') {
                    room.whiteTimeLeft = Math.max(0, room.whiteTimeLeft - elapsed);

                    // Check for timeout
                    if (room.whiteTimeLeft <= 0) {
                        handleTimerTimeout(roomId, 'white');
                        return;
                    }
                } else {
                    room.blackTimeLeft = Math.max(0, room.blackTimeLeft - elapsed);

                    // Check for timeout
                    if (room.blackTimeLeft <= 0) {
                        handleTimerTimeout(roomId, 'black');
                        return;
                    }
                }

                room.lastTimerUpdate = now;
            }

            // Broadcast timer state to all in room
            io.to(roomId).emit('timer_sync', {
                whiteTimeLeft: room.whiteTimeLeft,
                blackTimeLeft: room.blackTimeLeft,
                activeColor: room.activeTimerColor
            });
        }, 1000); // Sync every second

        roomTimerIntervals.set(roomId, interval);
    };

    // Helper function to stop timer sync for a room
    const stopTimerSync = (roomId: string) => {
        const interval = roomTimerIntervals.get(roomId);
        if (interval) {
            clearInterval(interval);
            roomTimerIntervals.delete(roomId);
        }
    };

    // Helper function to handle timer timeout
    const handleTimerTimeout = (roomId: string, color: 'white' | 'black') => {
        console.log(`[Server] Timeout detected for ${color} in room ${roomId}`);

        const room = getRoom(roomId);
        if (!room) {
            console.error(`[Server] Room ${roomId} not found for timeout handling`);
            return;
        }

        // Stop timer
        stopTimerSync(roomId);
        room.activeTimerColor = null;

        // Set game over state
        const winner = color === 'white' ? 'black' : 'white';
        room.gameState.status = 'resignation'; // Using resignation for timeout
        room.gameState.winner = winner;

        // Update player stats
        const winnerPlayer = winner === 'white' ? room.whitePlayer : room.blackPlayer;
        const loserPlayer = winner === 'white' ? room.blackPlayer : room.whitePlayer;

        if (winnerPlayer && loserPlayer) {
            updatePlayerStats(winnerPlayer.id, 'win').catch(console.error);
            updatePlayerStats(loserPlayer.id, 'loss').catch(console.error);
        }

        console.log(`[Server] Emitting game_over for timeout in room ${roomId}, winner: ${winner}`);

        // Save game then emit
        saveGame(room, winner, 'timeout').then((gameId) => {
            room.gameSaved = true;
            io.to(roomId).emit('game_over', {
                result: winner,
                reason: 'timeout',
                gameState: room.gameState,
                gameId,
            });
        });
    };

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('create_game', (data: { userId: string; userName: string; colorPreference?: 'white' | 'black' | 'random'; timeControl?: TimeControlPreset | null }) => {
            const player: Player = {
                id: data.userId,
                name: data.userName,
                socketId: socket.id
            };

            const { room, color } = createRoom(player, data.colorPreference || 'random', data.timeControl || null);
            socket.join(room.roomId);

            socket.emit('game_created', {
                roomId: room.roomId,
                color: color,
                gameState: room.gameState,
                timeControl: room.timeControl,
                whiteTimeLeft: room.whiteTimeLeft,
                blackTimeLeft: room.blackTimeLeft
            });

            // Start timer sync if time control is set
            if (room.timeControl && room.timeControl.category !== 'unlimited') {
                startTimerSync(room.roomId);
            }
        });

        socket.on('join_game', (data: { roomId: string; userId: string; userName: string }) => {
            const player: Player = {
                id: data.userId,
                name: data.userName,
                socketId: socket.id
            };

            // First check if room exists
            const room = getRoom(data.roomId);
            if (!room) {
                socket.emit('game_error', { message: 'Room not found' });
                return;
            }

            // Try to join as player
            const result = joinRoomAsPlayer(data.roomId, player);

            if (!result) {
                // Room exists but is full
                socket.emit('game_error', { message: 'Room is full' });
                return;
            }

            const { room: joinedRoom, role } = result;
            socket.join(joinedRoom.roomId);

            // Notify the joiner
            socket.emit('game_joined', {
                roomId: joinedRoom.roomId,
                color: role,
                gameState: joinedRoom.gameState,
                whitePlayer: joinedRoom.whitePlayer,
                blackPlayer: joinedRoom.blackPlayer,
                spectatorCount: joinedRoom.spectators.length,
                timeControl: joinedRoom.timeControl,
                whiteTimeLeft: joinedRoom.whiteTimeLeft,
                blackTimeLeft: joinedRoom.blackTimeLeft,
                activeTimerColor: joinedRoom.activeTimerColor,
                whiteReady: joinedRoom.whiteReady,
                blackReady: joinedRoom.blackReady
            });

            // Notify everyone in the room
            io.to(joinedRoom.roomId).emit('player_joined', {
                role,
                player,
                whitePlayer: joinedRoom.whitePlayer,
                blackPlayer: joinedRoom.blackPlayer,
                spectatorCount: joinedRoom.spectators.length
            });

            // If both players are present, notify game is ready
            if (joinedRoom.whitePlayer && joinedRoom.blackPlayer && joinedRoom.gameState.status === 'playing') {
                io.to(joinedRoom.roomId).emit('game_ready', {
                    whitePlayer: joinedRoom.whitePlayer,
                    blackPlayer: joinedRoom.blackPlayer
                });

                // Note: Timer will start when both players click "Ready"
                // This is handled by the player_ready event
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
                spectatorCount: room.spectators.length,
                timeControl: room.timeControl,
                whiteTimeLeft: room.whiteTimeLeft,
                blackTimeLeft: room.blackTimeLeft,
                activeTimerColor: room.activeTimerColor,
                whiteReady: room.whiteReady,
                blackReady: room.blackReady
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
                // Handle timer logic for timed games
                if (updatedRoom.timeControl && updatedRoom.timeControl.category !== 'unlimited') {
                    // Determine who just moved (opposite of current turn)
                    const movedColor = data.gameState.turn === 'w' ? 'black' : 'white';

                    // Add increment to player who just moved
                    if (updatedRoom.timeControl.increment > 0) {
                        if (movedColor === 'white') {
                            updatedRoom.whiteTimeLeft += updatedRoom.timeControl.increment;
                        } else {
                            updatedRoom.blackTimeLeft += updatedRoom.timeControl.increment;
                        }
                    }

                    // Switch active timer to opponent
                    const nextColor = data.gameState.turn === 'w' ? 'white' : 'black';
                    updatedRoom.activeTimerColor = nextColor;
                    updatedRoom.lastTimerUpdate = Date.now();

                    // If this is the first move, start the timer
                    if (!updatedRoom.timerStartedAt) {
                        updatedRoom.timerStartedAt = Date.now();
                    }

                    // Track game start time (first activity)
                    if (!updatedRoom.gameStartedAt) {
                        updatedRoom.gameStartedAt = Date.now();
                    }

                    // Emit timer update
                    io.to(data.roomId).emit('timer_updated', {
                        whiteTimeLeft: updatedRoom.whiteTimeLeft,
                        blackTimeLeft: updatedRoom.blackTimeLeft,
                        activeColor: updatedRoom.activeTimerColor
                    });
                }

                // For unlimited games, track start on first move
                if (!updatedRoom.gameStartedAt) {
                    updatedRoom.gameStartedAt = Date.now();
                }

                socket.to(data.roomId).emit('move_made', {
                    move: data.move,
                    gameState: updatedRoom.gameState
                });

                // Check if game ended with checkmate or stalemate
                if (data.gameState.status === 'checkmate' && updatedRoom.whitePlayer && updatedRoom.blackPlayer) {
                    const winner = data.gameState.turn === 'w' ? 'b' : 'w'; // Winner is opposite of current turn
                    const winnerPlayer = winner === 'w' ? updatedRoom.whitePlayer : updatedRoom.blackPlayer;
                    const loserPlayer = winner === 'w' ? updatedRoom.blackPlayer : updatedRoom.whitePlayer;

                    updatePlayerStats(winnerPlayer.id, 'win').catch(console.error);
                    updatePlayerStats(loserPlayer.id, 'loss').catch(console.error);

                    stopTimerSync(data.roomId);
                    const resultColor = winner === 'w' ? 'white' : 'black';
                    saveGame(updatedRoom, resultColor, 'checkmate').then((gameId) => {
                        updatedRoom.gameSaved = true;
                        io.to(data.roomId).emit('game_over', {
                            result: resultColor,
                            reason: 'checkmate',
                            gameState: updatedRoom.gameState,
                            gameId,
                        });
                    });
                } else if ((data.gameState.status === 'stalemate' || data.gameState.status === 'draw') && updatedRoom.whitePlayer && updatedRoom.blackPlayer) {
                    updatePlayerStats(updatedRoom.whitePlayer.id, 'draw').catch(console.error);
                    updatePlayerStats(updatedRoom.blackPlayer.id, 'draw').catch(console.error);

                    stopTimerSync(data.roomId);
                    const drawReason = data.gameState.status === 'stalemate' ? 'stalemate' : 'draw';
                    saveGame(updatedRoom, 'draw', drawReason).then((gameId) => {
                        updatedRoom.gameSaved = true;
                        io.to(data.roomId).emit('game_over', {
                            result: 'draw',
                            reason: drawReason,
                            gameState: updatedRoom.gameState,
                            gameId,
                        });
                    });
                }
            }
        });

        socket.on('leave_game', (data: { roomId: string }) => {
            // Snapshot the room state BEFORE leaveRoom nulls the leaving player's slot
            const roomBeforeLeave = getRoom(data.roomId);
            const result = leaveRoom(data.roomId, socket.id);
            socket.leave(data.roomId);

            // result.room may be null if the room was deleted (both players gone)
            // Use the room that still exists, or fall back to the pre-leave snapshot
            const activeRoom = result.room ?? roomBeforeLeave;

            if (activeRoom) {
                io.to(data.roomId).emit('player_left', {
                    socketId: socket.id
                });

                // Notify about spectator count change
                io.to(data.roomId).emit('spectator_left', {
                    count: activeRoom.spectators.length
                });

                // Only emit game_over if this leave JUST caused the game to end (resignation by leaving)
                if (result.gameJustEnded && result.resignedColor) {
                    const winner = result.resignedColor === 'white' ? 'black' : 'white';
                    const winnerPlayer = result.remainingPlayer;
                    const loserPlayer = result.resignedPlayer;

                    if (winnerPlayer && loserPlayer) {
                        updatePlayerStats(winnerPlayer.id, 'win').catch(console.error);
                        updatePlayerStats(loserPlayer.id, 'loss').catch(console.error);
                    }

                    // Build a temporary room snapshot with both players restored for saveGame()
                    const roomForSave = {
                        ...activeRoom,
                        whitePlayer: result.resignedColor === 'white' ? result.resignedPlayer ?? null : result.remainingPlayer ?? null,
                        blackPlayer: result.resignedColor === 'black' ? result.resignedPlayer ?? null : result.remainingPlayer ?? null,
                    };

                    stopTimerSync(data.roomId);
                    saveGame(roomForSave, winner, 'resignation').then((gameId) => {
                        roomForSave.gameSaved = true;
                        // Also mark the active room as saved if it still exists
                        if (result.room) result.room.gameSaved = true;
                        io.to(data.roomId).emit('game_over', {
                            result: winner,
                            reason: 'resignation',
                            gameState: activeRoom.gameState,
                            gameId,
                        });
                    });
                }

                // If room still exists, send update
                if (result.room) {
                    io.to(data.roomId).emit('room_updated', result.room);
                }
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

                    // Update player stats for both players
                    if (room.whitePlayer && room.blackPlayer) {
                        updatePlayerStats(room.whitePlayer.id, 'draw').catch(console.error);
                        updatePlayerStats(room.blackPlayer.id, 'draw').catch(console.error);
                    }

                    stopTimerSync(data.roomId);

                    // Immediately notify the draw offerer so their board freezes
                    // without waiting for the async DB save round-trip.
                    socket.to(data.roomId).emit('draw_accepted');
                    saveGame(room, 'draw', 'agreement').then((gameId) => {
                        room.gameSaved = true;
                        io.to(data.roomId).emit('game_over', {
                            result: 'draw',
                            reason: 'agreement',
                            gameState: room.gameState,
                            gameId,
                        });
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

                // Update player stats
                const winnerPlayer = winner === 'white' ? room.whitePlayer : room.blackPlayer;
                const loserPlayer = winner === 'white' ? room.blackPlayer : room.whitePlayer;

                if (winnerPlayer && loserPlayer) {
                    updatePlayerStats(winnerPlayer.id, 'win').catch(console.error);
                    updatePlayerStats(loserPlayer.id, 'loss').catch(console.error);
                }

                stopTimerSync(data.roomId);
                saveGame(room, winner, 'resignation').then((gameId) => {
                    room.gameSaved = true;
                    io.to(data.roomId).emit('game_over', {
                        result: winner,
                        reason: 'resignation',
                        gameState: room.gameState,
                        gameId,
                    });
                });
            }
        });

        // Handle timeout event from client
        socket.on('timeout', (data: { roomId: string; color: 'white' | 'black' }) => {
            handleTimerTimeout(data.roomId, data.color);
        });

        // Handle player ready event
        socket.on('player_ready', (data: { roomId: string; color: 'white' | 'black' }) => {
            const room = getRoom(data.roomId);
            if (!room) return;

            console.log(`[Server] Player ${data.color} is ready in room ${data.roomId}`);

            // Update ready state
            if (data.color === 'white') {
                room.whiteReady = true;
            } else {
                room.blackReady = true;
            }

            // Broadcast ready status to all players
            io.to(data.roomId).emit('ready_status_changed', {
                whiteReady: room.whiteReady,
                blackReady: room.blackReady
            });

            // If both players are ready and timer hasn't started, start it
            if (room.whiteReady && room.blackReady && !room.timerStartedAt && room.timeControl && room.timeControl.category !== 'unlimited') {
                console.log(`[Server] Both players ready, starting timer in room ${data.roomId}`);

                room.timerStartedAt = Date.now();
                room.lastTimerUpdate = Date.now();
                room.activeTimerColor = 'white'; // White starts

                // Broadcast timer start to all players
                io.to(data.roomId).emit('timer_updated', {
                    whiteTimeLeft: room.whiteTimeLeft,
                    blackTimeLeft: room.blackTimeLeft,
                    activeColor: room.activeTimerColor
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
