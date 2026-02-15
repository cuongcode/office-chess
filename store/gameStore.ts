import { create } from 'zustand';
import { Chess } from 'chess.js';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket-client';

interface GameState {
    chess: Chess;
    fen: string;
    turn: 'w' | 'b';
    history: string[];
    status: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'check' | 'resignation';
    winner: 'w' | 'b' | null;
    boardOrientation: 'white' | 'black';
    lastMove: { from: string; to: string } | null;

    // Online State
    socket: Socket | null;
    roomId: string | null;
    playerColor: 'white' | 'black' | 'spectator' | null;
    whitePlayerName: string | null;
    blackPlayerName: string | null;
    isConnected: boolean;
    spectatorCount: number;
    isOnline: boolean;

    makeMove: (source: string, target: string, promotion?: string) => boolean;
    undoMove: () => void;
    resetGame: () => void;
    flipBoard: () => void;

    // Socket Actions
    connect: () => Promise<void>;
    createGame: (userId: string, userName: string) => void;
    joinGame: (roomId: string, userId: string, userName: string) => void;
    leaveGame: () => void;
    resign: () => void;
    offerDraw: () => void;
    rejoinGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    chess: new Chess(),
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'w',
    history: [],
    status: 'playing',
    winner: null,
    boardOrientation: 'white',
    lastMove: null,

    // Online State
    socket: null,
    roomId: null,
    playerColor: null,
    whitePlayerName: null,
    blackPlayerName: null,
    isConnected: false,
    spectatorCount: 0,
    isOnline: false,

    makeMove: (source, target, promotion = 'q') => {
        const { chess, isOnline, socket, roomId } = get();
        try {
            // If online and it's not our turn or we are spectators, prevent move
            if (isOnline) {
                const { playerColor, turn } = get();
                // If we are spectator, we can't move
                if (playerColor === 'spectator') return false;
                // If it's not our color's turn, we can't move
                if (playerColor === 'white' && turn !== 'w') return false;
                if (playerColor === 'black' && turn !== 'b') return false;
            }

            const move = chess.move({ from: source, to: target, promotion });

            if (move) {
                let status: GameState['status'] = 'playing';
                let winner: GameState['winner'] = null;

                if (chess.isCheckmate()) {
                    status = 'checkmate';
                    winner = chess.turn() === 'w' ? 'b' : 'w';
                } else if (chess.isDraw()) {
                    status = 'draw';
                } else if (chess.isStalemate()) {
                    status = 'stalemate';
                } else if (chess.isCheck()) {
                    status = 'check';
                }

                set({
                    fen: chess.fen(),
                    turn: chess.turn(),
                    history: chess.history(),
                    status,
                    winner,
                    lastMove: { from: source, to: target },
                });

                // Emit socket event if online
                if (isOnline && socket && roomId) {
                    socket.emit('make_move', {
                        roomId,
                        move: { from: source, to: target, promotion },
                        gameState: {
                            fen: chess.fen(),
                            moveHistory: chess.history(),
                            turn: chess.turn(),
                            status: status
                        }
                    });
                }
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    },

    undoMove: () => {
        const { chess, isOnline } = get();
        // Disable undo for online games for now unless we implement takeback requests
        if (isOnline) return;

        chess.undo();
        set({
            fen: chess.fen(),
            turn: chess.turn(),
            history: chess.history(),
            status: 'playing', // Simple reset to playing or check re-eval
            winner: null,
            lastMove: null,
        });
        // Re-evaluate check status after undo
        if (chess.isCheck()) {
            set({ status: 'check' });
        }
    },

    resetGame: () => {
        const { isOnline } = get();
        if (isOnline) return; // Verify logic for online reset

        const newChess = new Chess();
        set({
            chess: newChess,
            fen: newChess.fen(),
            turn: 'w',
            history: [],
            status: 'playing',
            winner: null,
            lastMove: null,
        });
    },

    flipBoard: () => {
        const { isOnline, playerColor } = get();
        if (isOnline && playerColor && playerColor !== 'spectator') {
            return; // Lock board
        }

        set((state) => ({
            boardOrientation: state.boardOrientation === 'white' ? 'black' : 'white',
        }));
    },

    // Socket Actions
    connect: async () => {
        const { socket } = get();
        if (socket?.connected) return;

        // Initialize socket server
        await fetch('/api/socket/io');

        const newSocket = getSocket();

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            set({ isConnected: true });
            get().rejoinGame();
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ isConnected: false });
        });

        newSocket.on('game_error', (error: any) => {
            console.error('Game error:', error);
            if (error.message === 'Room not found') {
                localStorage.removeItem('chess_room_id');
            }
        });

        newSocket.on('game_created', ({ roomId, color }: { roomId: string, color: 'white' | 'black' }) => {
            console.log('Game created:', roomId);
            const savedName = localStorage.getItem('chess_user_name');
            localStorage.setItem('chess_room_id', roomId);
            set({
                roomId,
                playerColor: color,
                boardOrientation: color === 'white' ? 'white' : 'black',
                isOnline: true,
                status: 'playing',
                whitePlayerName: color === 'white' ? savedName : null,
                blackPlayerName: color === 'black' ? savedName : null,
                // Reset board for new game
                chess: new Chess(),
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                turn: 'w',
                history: [],
                lastMove: null,
                winner: null
            });
        });

        newSocket.on('game_joined', ({ roomId, color, gameState, whitePlayer, blackPlayer, spectatorCount }: any) => {
            // Hydrate state from server
            const newChess = new Chess(gameState.fen);
            set({
                roomId,
                playerColor: color,
                boardOrientation: color === 'spectator' ? 'white' : (color === 'white' ? 'white' : 'black'),
                isOnline: true,
                chess: newChess,
                fen: gameState.fen,
                turn: gameState.turn,
                history: gameState.moveHistory || [],
                status: gameState.status as any,
                spectatorCount,
                whitePlayerName: whitePlayer?.name || null,
                blackPlayerName: blackPlayer?.name || null,
            });
            // Ensure persistence if joined via rejoin logic or normal join
            localStorage.setItem('chess_room_id', roomId);
        });

        newSocket.on('player_joined', ({ role, player, whitePlayer, blackPlayer, spectatorCount }: any) => {
            const { playerColor } = get();

            // If I am playing, and this is my opponent joining
            if (playerColor !== 'spectator') {
                // Logic for opponent joining is handled by explicit whitePlayerName/blackPlayerName updates below
            }

            if (role === 'white') {
                set({ whitePlayerName: player.name });
            } else if (role === 'black') {
                set({ blackPlayerName: player.name });
            }

            set({ spectatorCount });
        });

        newSocket.on('move_made', ({ move, gameState }: any) => {
            const { chess } = get();
            chess.move(move); // Apply move locally to keep chess instance in sync
            set({
                fen: gameState.fen,
                turn: gameState.turn,
                history: gameState.moveHistory || chess.history(), // Fallback
                status: gameState.status as any,
                lastMove: move
            });
        });

        newSocket.on('game_over', ({ result, reason, gameState }: any) => {
            set({
                status: reason === 'checkmate' ? 'checkmate' : (reason === 'draw' ? 'draw' : 'resignation'), // simplified mapping
                winner: result === 'draw' ? null : (result === 'white' ? 'w' : 'b')
            });
        });

        newSocket.on('spectator_joined', ({ count }: { count: number }) => {
            set({ spectatorCount: count });
        });

        newSocket.on('spectator_left', ({ count }: { count: number }) => {
            set({ spectatorCount: count });
        });

        set({ socket: newSocket });
    },

    createGame: (userId, userName) => {
        const { socket } = get();
        if (socket) {
            console.log('Emitting create_game', { userId, userName });
            socket.emit('create_game', { userId, userName });
            localStorage.setItem('chess_user_id', userId);
            localStorage.setItem('chess_user_name', userName);
        } else {
            console.warn('Cannot create game: socket not connected');
        }
    },

    joinGame: (roomId, userId, userName) => {
        const { socket } = get();
        if (socket) {
            socket.emit('join_game', { roomId, userId, userName });
        }
    },

    leaveGame: () => {
        const { socket, roomId } = get();
        if (socket && roomId) {
            socket.emit('leave_game', { roomId });
        }
        // Reset online state
        set({
            isOnline: false,
            roomId: null,
            playerColor: null,
            whitePlayerName: null,
            blackPlayerName: null,
            spectatorCount: 0,
        });
    },

    resign: () => {
        const { socket, roomId, playerColor } = get();
        if (socket && roomId && playerColor && playerColor !== 'spectator') {
            socket.emit('resign', { roomId, color: playerColor });
        }
    },

    offerDraw: () => {
        const { socket, roomId, playerColor } = get();
        if (socket && roomId && playerColor && playerColor !== 'spectator') {
            socket.emit('offer_draw', { roomId, color: playerColor });
        }
    },

    rejoinGame: () => {
        const roomId = localStorage.getItem('chess_room_id');
        const userId = localStorage.getItem('chess_user_id');
        const userName = localStorage.getItem('chess_user_name');

        if (roomId && userId && userName) {
            const { socket } = get();
            if (socket) {
                socket.emit('join_game', { roomId, userId, userName });
            }
        }
    }
}));
