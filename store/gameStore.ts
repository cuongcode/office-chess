import { create } from 'zustand';
import { Chess } from 'chess.js';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket-client';
import { TimeControlPreset } from '@/lib/timeControls';

interface GameState {
    chess: Chess;
    fen: string;
    turn: 'w' | 'b';
    history: string[];
    status: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'check' | 'resignation';
    winner: 'w' | 'b' | null;
    boardOrientation: 'white' | 'black';
    lastMove: { from: string; to: string } | null;
    capturedPieces: {
        white: string[]; // Pieces captured BY white (black's lost pieces)
        black: string[]; // Pieces captured BY black (white's lost pieces)
    };

    // Online State
    socket: Socket | null;
    roomId: string | null;
    playerColor: 'white' | 'black' | 'spectator' | null;
    whitePlayerName: string | null;
    blackPlayerName: string | null;
    isConnected: boolean;
    spectatorCount: number;
    isOnline: boolean;
    joinError: string | null;

    // Timer State
    timeControl: TimeControlPreset | null;
    whiteTimeLeft: number; // seconds remaining
    blackTimeLeft: number; // seconds remaining
    timerActive: boolean;
    activeTimerColor: 'white' | 'black' | null;
    timerIntervalId: NodeJS.Timeout | null;
    lastTimerUpdate: number | null; // timestamp

    // Ready State
    whiteReady: boolean;
    blackReady: boolean;

    makeMove: (source: string, target: string, promotion?: string) => boolean;
    undoMove: () => void;
    resetGame: () => void;
    flipBoard: () => void;

    // Socket Actions
    connect: () => Promise<void>;
    createGame: (userId: string, userName: string, colorPreference?: 'white' | 'black' | 'random', timeControl?: TimeControlPreset | null) => void;
    joinGame: (roomId: string, userId: string, userName: string) => void;
    spectateGame: (roomId: string, userId: string, userName: string) => void;
    leaveGame: () => void;
    resign: () => void;
    offerDraw: () => void;
    rejoinGame: () => void;
    clearJoinError: () => void;

    // Timer Actions
    setTimeControl: (preset: TimeControlPreset | null) => void;
    startTimer: (color: 'white' | 'black') => void;
    pauseTimer: () => void;
    updateTimerTick: () => void;
    switchTimer: (color: 'white' | 'black') => void;
    addIncrement: (color: 'white' | 'black') => void;
    resetTimers: () => void;
    handleTimeout: (color: 'white' | 'black') => void;
    syncTimerFromServer: (data: { whiteTimeLeft: number; blackTimeLeft: number; activeColor: 'white' | 'black' | null }) => void;

    // Ready Actions
    setPlayerReady: () => void;
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
    capturedPieces: {
        white: [],
        black: []
    },

    // Online State
    socket: null,
    roomId: null,
    playerColor: null,
    whitePlayerName: null,
    blackPlayerName: null,
    isConnected: false,
    spectatorCount: 0,
    isOnline: false,
    joinError: null,

    // Timer State
    timeControl: null,
    whiteTimeLeft: 0,
    blackTimeLeft: 0,
    timerActive: false,
    activeTimerColor: null,
    timerIntervalId: null,
    lastTimerUpdate: null,

    // Ready State
    whiteReady: false,
    blackReady: false,

    makeMove: (source, target, promotion = 'q') => {
        const { chess, isOnline, socket, roomId, capturedPieces } = get();
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

                // Track captured pieces
                const newCapturedPieces = { ...capturedPieces };
                if (move.captured) {
                    // Determine who captured (opposite of current turn since move was made)
                    const capturingColor = move.color === 'w' ? 'white' : 'black';
                    newCapturedPieces[capturingColor] = [...newCapturedPieces[capturingColor], move.captured];
                }

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
                    capturedPieces: newCapturedPieces,
                });

                // Handle timer logic for timed games
                const { playerColor, timeControl } = get();
                if (timeControl && timeControl.category !== 'unlimited') {
                    // Add increment to the player who just moved
                    const movedColor = chess.turn() === 'w' ? 'black' : 'white'; // Opposite of current turn
                    get().addIncrement(movedColor);

                    // Switch timer to opponent
                    const nextColor = chess.turn() === 'w' ? 'white' : 'black';
                    get().switchTimer(nextColor);
                }

                // Emit socket event if online
                if (isOnline && socket && roomId) {
                    socket.emit('make_move', {
                        roomId,
                        move: { from: source, to: target, promotion },
                        gameState: {
                            fen: chess.fen(),
                            moveHistory: chess.history(),
                            turn: chess.turn(),
                            status: status,
                            lastMove: { from: source, to: target },
                            capturedPieces: newCapturedPieces
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
            capturedPieces: { white: [], black: [] }, // Reset captured pieces on undo
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
            capturedPieces: { white: [], black: [] },
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

            // Set user-friendly error message
            let errorMessage = 'An error occurred';
            if (error.message === 'Room not found') {
                errorMessage = 'Game not found. Please check the code and try again.';
            } else if (error.message === 'Room is full') {
                errorMessage = 'This game is full. You can spectate instead.';
            } else {
                errorMessage = error.message || 'Failed to join game';
            }

            set({ joinError: errorMessage });

            // Clear room ID on any join error to prevent stuck states
            if (error.message === 'Room not found' || error.message === 'Room is full') {
                localStorage.removeItem('chess_room_id');
                // Reset to menu state
                set({
                    isOnline: false,
                    roomId: null,
                    playerColor: null,
                    whitePlayerName: null,
                    blackPlayerName: null,
                    spectatorCount: 0,
                });
            }
        });

        newSocket.on('game_created', ({ roomId, color, timeControl, whiteTimeLeft, blackTimeLeft }: {
            roomId: string;
            color: 'white' | 'black';
            timeControl?: TimeControlPreset | null;
            whiteTimeLeft?: number;
            blackTimeLeft?: number;
        }) => {
            console.log('Game created:', roomId, 'timeControl:', timeControl);
            const savedName = localStorage.getItem('chess_user_name');
            localStorage.setItem('chess_room_id', roomId);

            // Set time control if provided
            if (timeControl) {
                get().setTimeControl(timeControl);
                // Store in localStorage for persistence
                localStorage.setItem('chess_time_control', JSON.stringify(timeControl));
            }

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
                winner: null,
                capturedPieces: { white: [], black: [] },
                // Set timer state if provided
                whiteTimeLeft: whiteTimeLeft !== undefined ? whiteTimeLeft : (timeControl && timeControl.category !== 'unlimited' ? timeControl.initialTime : 0),
                blackTimeLeft: blackTimeLeft !== undefined ? blackTimeLeft : (timeControl && timeControl.category !== 'unlimited' ? timeControl.initialTime : 0),
                whiteReady: false,
                blackReady: false
            });
        });

        newSocket.on('game_joined', ({ roomId, color, gameState, whitePlayer, blackPlayer, spectatorCount, timeControl, whiteTimeLeft, blackTimeLeft, activeTimerColor, whiteReady, blackReady }: any) => {
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
                lastMove: gameState.lastMove || null,
                capturedPieces: gameState.capturedPieces || { white: [], black: [] },
                joinError: null, // Clear any previous errors on successful join
                // Set timer state
                timeControl: timeControl || null,
                whiteTimeLeft: whiteTimeLeft !== undefined ? whiteTimeLeft : 0,
                blackTimeLeft: blackTimeLeft !== undefined ? blackTimeLeft : 0,
                activeTimerColor: activeTimerColor || null,
                // Set ready state
                whiteReady: whiteReady || false,
                blackReady: blackReady || false
            });

            // Set time control if provided
            if (timeControl) {
                get().setTimeControl(timeControl);
                // Store in localStorage for persistence
                localStorage.setItem('chess_time_control', JSON.stringify(timeControl));

                // Start timer if there's an active color and game is in progress
                if (activeTimerColor && gameState.status === 'playing') {
                    get().startTimer(activeTimerColor);
                }
            }

            // Ensure persistence if joined via rejoin logic or normal join
            localStorage.setItem('chess_room_id', roomId);
            // Store player role for proper rejoining
            localStorage.setItem('chess_player_role', color);
        });

        newSocket.on('player_joined', ({ role, player, whitePlayer, blackPlayer, spectatorCount }: any) => {
            const { playerColor } = get();

            // If I am playing, and this is my opponent joining
            if (playerColor !== 'spectator') {
                // Logic for opponent joining is handled by explicit whitePlayerName/blackPlayerName updates below
            }

            if (whitePlayer) {
                set({ whitePlayerName: whitePlayer.name });
            }
            if (blackPlayer) {
                set({ blackPlayerName: blackPlayer.name });
            }

            set({ spectatorCount });
        });

        newSocket.on('move_made', ({ move, gameState }: any) => {
            // The server sends us the authoritative game state after the move
            // We should trust the server's FEN rather than trying to apply the move locally
            const newChess = new Chess(gameState.fen);

            set({
                chess: newChess,
                fen: gameState.fen,
                turn: gameState.turn,
                history: gameState.moveHistory || newChess.history(),
                status: gameState.status as any,
                lastMove: { from: move.from, to: move.to },
                capturedPieces: gameState.capturedPieces || { white: [], black: [] }
            });
        });

        newSocket.on('game_over', ({ result, reason, gameState }: any) => {
            console.log(`Game over received: result=${result}, reason=${reason}`);

            // Stop the timer when game ends
            get().pauseTimer();

            // Map server reasons to client status
            let status: GameState['status'] = 'playing';
            if (reason === 'checkmate') {
                status = 'checkmate';
            } else if (reason === 'draw' || reason === 'agreement') {
                status = 'draw';
            } else if (reason === 'resignation') {
                status = 'resignation';
            } else if (reason === 'timeout') {
                // Use checkmate status for timeout to show proper game over modal
                status = 'checkmate';
            }

            set({
                status,
                winner: result === 'draw' ? null : (result === 'white' ? 'w' : 'b')
            });
        });

        newSocket.on('spectator_joined', ({ count }: { count: number }) => {
            set({ spectatorCount: count });
        });

        newSocket.on('spectator_left', ({ count }: { count: number }) => {
            set({ spectatorCount: count });
        });

        // Timer sync events
        newSocket.on('timer_sync', (data: { whiteTimeLeft: number; blackTimeLeft: number; activeColor: 'white' | 'black' | null }) => {
            get().syncTimerFromServer(data);
        });

        newSocket.on('timer_updated', (data: { whiteTimeLeft: number; blackTimeLeft: number; activeColor: 'white' | 'black' | null }) => {
            get().syncTimerFromServer(data);
        });

        newSocket.on('timer_paused', () => {
            get().pauseTimer();
        });

        newSocket.on('timer_resumed', (data: { color: 'white' | 'black' }) => {
            get().startTimer(data.color);
        });

        // Ready state events
        newSocket.on('ready_status_changed', (data: { whiteReady: boolean; blackReady: boolean }) => {
            console.log('Ready status changed:', data);
            set({
                whiteReady: data.whiteReady,
                blackReady: data.blackReady
            });

            // Start timer if both players are ready and timer hasn't started
            const { timeControl, timerActive } = get();
            if (data.whiteReady && data.blackReady && !timerActive && timeControl && timeControl.category !== 'unlimited') {
                console.log('Both players ready, starting timer');
                get().startTimer('white');
            }
        });

        set({ socket: newSocket });
    },

    createGame: (userId, userName, colorPreference = 'random', timeControl = null) => {
        const { socket } = get();
        if (socket) {
            console.log('Emitting create_game', { userId, userName, colorPreference, timeControl });
            socket.emit('create_game', { userId, userName, colorPreference, timeControl });
            localStorage.setItem('chess_user_id', userId);
            localStorage.setItem('chess_user_name', userName);

            // Set time control locally
            get().setTimeControl(timeControl);
        } else {
            console.warn('Cannot create game: socket not connected');
        }
    },

    joinGame: (roomId, userId, userName) => {
        const { socket } = get();
        if (socket) {
            socket.emit('join_game', { roomId, userId, userName });
            localStorage.setItem('chess_user_id', userId);
            localStorage.setItem('chess_user_name', userName);
        }
    },

    spectateGame: (roomId, userId, userName) => {
        const { socket } = get();
        if (socket) {
            socket.emit('spectate_game', { roomId, userId, userName });
            localStorage.setItem('chess_user_id', userId);
            localStorage.setItem('chess_user_name', userName);
        }
    },

    leaveGame: () => {
        const { socket, roomId } = get();
        if (socket && roomId) {
            socket.emit('leave_game', { roomId });
        }

        // Clear local storage to prevent auto-rejoin
        localStorage.removeItem('chess_room_id');
        localStorage.removeItem('chess_player_role');
        localStorage.removeItem('chess_time_control');

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
        const playerRole = localStorage.getItem('chess_player_role');

        if (roomId && userId && userName) {
            const { socket } = get();
            if (socket) {
                // Use the appropriate event based on stored role
                if (playerRole === 'spectator') {
                    socket.emit('spectate_game', { roomId, userId, userName });
                } else {
                    // For players (white/black) or if role is unknown, try to join as player
                    socket.emit('join_game', { roomId, userId, userName });
                }
            }
        }
    },

    clearJoinError: () => {
        set({ joinError: null });
    },

    // Timer Actions
    setTimeControl: (preset) => {
        if (!preset || preset.category === 'unlimited') {
            set({
                timeControl: preset,
                whiteTimeLeft: 0,
                blackTimeLeft: 0,
                timerActive: false,
                activeTimerColor: null
            });
        } else {
            set({
                timeControl: preset,
                whiteTimeLeft: preset.initialTime,
                blackTimeLeft: preset.initialTime,
                timerActive: false,
                activeTimerColor: null
            });
        }
    },

    startTimer: (color) => {
        const { timerIntervalId, timeControl } = get();

        // Don't start timer if no time control or unlimited
        if (!timeControl || timeControl.category === 'unlimited') return;

        // Clear existing interval if any
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
        }

        // Start new interval
        const intervalId = setInterval(() => {
            get().updateTimerTick();
        }, 100); // Update every 100ms for smooth display

        set({
            timerActive: true,
            activeTimerColor: color,
            timerIntervalId: intervalId,
            lastTimerUpdate: Date.now()
        });
    },

    pauseTimer: () => {
        const { timerIntervalId } = get();

        if (timerIntervalId) {
            clearInterval(timerIntervalId);
        }

        set({
            timerActive: false,
            timerIntervalId: null
        });
    },

    updateTimerTick: () => {
        const { activeTimerColor, whiteTimeLeft, blackTimeLeft, timerActive } = get();

        if (!timerActive || !activeTimerColor) return;

        const now = Date.now();
        const { lastTimerUpdate } = get();
        const elapsed = lastTimerUpdate ? (now - lastTimerUpdate) / 1000 : 0.1;

        if (activeTimerColor === 'white') {
            const newTime = Math.max(0, whiteTimeLeft - elapsed);
            set({ whiteTimeLeft: newTime, lastTimerUpdate: now });

            if (newTime <= 0) {
                get().handleTimeout('white');
            }
        } else {
            const newTime = Math.max(0, blackTimeLeft - elapsed);
            set({ blackTimeLeft: newTime, lastTimerUpdate: now });

            if (newTime <= 0) {
                get().handleTimeout('black');
            }
        }
    },

    switchTimer: (color) => {
        const { timeControl, timerIntervalId } = get();

        // Don't switch if no time control or unlimited
        if (!timeControl || timeControl.category === 'unlimited') return;

        // Clear existing interval
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
        }

        // Start timer for the new color
        get().startTimer(color);
    },

    addIncrement: (color) => {
        const { timeControl } = get();

        if (!timeControl || timeControl.increment === 0) return;

        if (color === 'white') {
            set((state) => ({
                whiteTimeLeft: state.whiteTimeLeft + timeControl.increment
            }));
        } else {
            set((state) => ({
                blackTimeLeft: state.blackTimeLeft + timeControl.increment
            }));
        }
    },

    resetTimers: () => {
        const { timeControl, timerIntervalId } = get();

        // Clear any active interval
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
        }

        if (!timeControl || timeControl.category === 'unlimited') {
            set({
                whiteTimeLeft: 0,
                blackTimeLeft: 0,
                timerActive: false,
                activeTimerColor: null,
                timerIntervalId: null,
                lastTimerUpdate: null
            });
        } else {
            set({
                whiteTimeLeft: timeControl.initialTime,
                blackTimeLeft: timeControl.initialTime,
                timerActive: false,
                activeTimerColor: null,
                timerIntervalId: null,
                lastTimerUpdate: null
            });
        }
    },

    handleTimeout: (color) => {
        const { socket, roomId, isOnline } = get();

        console.log(`Timeout detected for ${color} player`);

        // Pause the timer
        get().pauseTimer();

        // Set game over state
        const winner = color === 'white' ? 'b' : 'w';
        set({
            status: 'checkmate', // Use checkmate status for timeout to avoid confusion with resignation
            winner
        });

        // Emit timeout to server if online
        if (isOnline && socket && roomId) {
            console.log(`Emitting timeout event to server for room ${roomId}`);
            socket.emit('timeout', { roomId, color });
        }
    },

    syncTimerFromServer: (data) => {
        const { whiteTimeLeft, blackTimeLeft, activeTimerColor } = get();

        // Calculate difference between local and server time
        const whiteDiff = Math.abs(whiteTimeLeft - data.whiteTimeLeft);
        const blackDiff = Math.abs(blackTimeLeft - data.blackTimeLeft);

        // If difference is significant (> 2 seconds), hard reset
        if (whiteDiff > 2 || blackDiff > 2) {
            set({
                whiteTimeLeft: data.whiteTimeLeft,
                blackTimeLeft: data.blackTimeLeft,
                activeTimerColor: data.activeColor,
                lastTimerUpdate: Date.now()
            });
        } else {
            // Gradual adjustment for small differences
            set({
                whiteTimeLeft: data.whiteTimeLeft,
                blackTimeLeft: data.blackTimeLeft,
                activeTimerColor: data.activeColor
            });
        }
    },

    setPlayerReady: () => {
        const { socket, roomId, playerColor, isOnline } = get();

        if (!isOnline || !socket || !roomId || playerColor === 'spectator') {
            console.warn('Cannot set ready: not in a valid game state');
            return;
        }

        console.log(`Setting ${playerColor} player ready`);

        // Emit ready event to server
        socket.emit('player_ready', { roomId, color: playerColor });
    }
}));
