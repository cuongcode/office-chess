import { create } from 'zustand';
import { Chess } from 'chess.js';

interface GameState {
    chess: Chess;
    fen: string;
    turn: 'w' | 'b';
    history: string[];
    status: 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'check';
    winner: 'w' | 'b' | null;
    boardOrientation: 'white' | 'black';
    lastMove: { from: string; to: string } | null;

    makeMove: (source: string, target: string, promotion?: string) => boolean;
    undoMove: () => void;
    resetGame: () => void;
    flipBoard: () => void;
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

    makeMove: (source, target, promotion = 'q') => {
        const { chess } = get();
        try {
            const move = chess.move({ from: source, to: target, promotion });

            if (move) {
                let status: GameState['status'] = 'playing';
                let winner: GameState['winner'] = null;

                if (chess.isCheckmate()) {
                    status = 'checkmate';
                    winner = chess.turn() === 'w' ? 'b' : 'w'; // If it's white's turn now, black won
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
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    },

    undoMove: () => {
        const { chess } = get();
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
        set((state) => ({
            boardOrientation: state.boardOrientation === 'white' ? 'black' : 'white',
        }));
    },
}));
