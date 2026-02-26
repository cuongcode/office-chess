'use client';

import { Trophy, Home, Handshake } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface GameOverModalProps {
    onReturnHome: () => void;
}

export function GameOverModal({ onReturnHome }: GameOverModalProps) {
    const { status, winner, playerColor, isOnline, leaveGame } = useGameStore();

    if (status === 'playing' || status === 'check') return null;

    const isWinner = winner && playerColor && (
        (winner === 'w' && playerColor === 'white') ||
        (winner === 'b' && playerColor === 'black')
    );

    const isSpectator = playerColor === 'spectator';

    const getTitle = () => {
        if (status === 'checkmate') {
            if (isOnline && !isSpectator) {
                return isWinner ? 'You Won!' : 'You Lost';
            }
            return winner === 'w' ? 'White Wins!' : 'Black Wins!';
        }
        if (status === 'draw') return 'Draw';
        if (status === 'stalemate') return 'Stalemate';
        if (status === 'resignation') {
            if (isOnline && !isSpectator) {
                return isWinner ? 'Opponent Resigned' : 'You Resigned';
            }
            return winner === 'w' ? 'White Wins (Resignation)' : 'Black Wins (Resignation)';
        }
        return 'Game Over';
    };

    const getSubtitle = () => {
        if (status === 'checkmate') return 'by checkmate';
        if (status === 'draw') return 'by agreement';
        if (status === 'stalemate') return 'no legal moves';
        if (status === 'resignation') return 'by resignation';
        return '';
    };

    const handleReturn = () => {
        if (isOnline) {
            leaveGame();
        }
        onReturnHome();
    };

    return (
        <div className="w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-lg text-card-fg-light dark:text-card-fg-dark">
                <div className="flex items-center gap-3 min-w-0">
                    {status === 'checkmate' || status === 'resignation' ? (
                        <Trophy
                            className={`w-5 h-5 flex-shrink-0 ${(isWinner || isSpectator || !isOnline) && winner
                                ? 'text-yellow-500'
                                : 'text-muted-fg-light dark:text-muted-fg-dark'
                                }`}
                        />
                    ) : (
                        <Handshake className="w-5 h-5 flex-shrink-0 text-muted-fg-light dark:text-muted-fg-dark" />
                    )}
                    <div className="min-w-0">
                        <p className="font-bold text-sm leading-tight">{getTitle()}</p>
                        {getSubtitle() && (
                            <p className="text-xs text-muted-fg-light dark:text-muted-fg-dark leading-tight">{getSubtitle()}</p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleReturn}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-muted-light dark:bg-muted-dark hover:bg-accent-light dark:hover:bg-accent-dark text-fg-light dark:text-fg-dark rounded-lg text-xs font-semibold transition-colors"
                >
                    <Home className="w-3.5 h-3.5" />
                    Leave
                </button>
            </div>
        </div>
    );
}
