'use client';

import { useGameStore } from '@/store/gameStore';

export default function GameStatus() {
    const { status, turn, winner } = useGameStore();

    let message = '';
    let subMessage = '';
    let colorClass = 'text-zinc-800 dark:text-zinc-100';

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
        <div className={`text-center p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 mb-4 ${status === 'checkmate' ? 'ring-2 ring-red-500' : ''}`}>
            <h2 className={`text-xl ${colorClass}`}>
                {message}
            </h2>
            {subMessage && <p className="text-sm text-zinc-500 mt-1">{subMessage}</p>}
        </div>
    );
}
