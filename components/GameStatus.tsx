'use client';

import { useGameStore } from '@/store/gameStore';

export function GameStatus() {
    const { status, turn, winner } = useGameStore();

    let message = '';
    let subMessage = '';
    let colorClass = 'text-fg-light dark:text-fg-dark';

    if (status === 'checkmate') {
        message = `Checkmate! ${winner === 'w' ? 'White' : 'Black'} wins.`;
        colorClass = 'text-red-600 dark:text-red-400 font-bold';
    } else if (status === 'draw' || status === 'stalemate') {
        message = 'Game Over - Draw';
        subMessage = status === 'stalemate' ? '(Stalemate)' : '(Insufficient Material/Repetition)';
        colorClass = 'text-amber-600 dark:text-amber-400 font-bold';
    } else if (status === 'check') {
        message = `${turn === 'w' ? 'White' : 'Black'} is in Check!`;
        colorClass = 'text-orange-600 dark:text-orange-400 font-bold animate-pulse';
    } else {
        message = `${turn === 'w' ? 'White' : 'Black'} to move`;
    }

    return (
        <div className={`text-center p-4 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark mb-4 ${status === 'checkmate' ? 'ring-2 ring-destructive-light dark:ring-destructive-dark' : ''}`}>
            <h2 className={`text-xl ${colorClass}`}>
                {message}
            </h2>
            {subMessage && <p className="text-sm text-muted-fg-light dark:text-muted-fg-dark mt-1">{subMessage}</p>}
        </div>
    );
}
