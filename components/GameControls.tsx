'use client';

import { useGameStore } from '@/store/gameStore';
import { RotateCcw, Copy, RotateCw } from 'lucide-react'; // Using icons for better UI

export function GameControls() {
    const { resetGame, undoMove, flipBoard } = useGameStore();

    return (
        <div className="flex gap-4 p-4 bg-card-light dark:bg-card-dark rounded-lg shadow-md border border-border-light dark:border-border-dark">
            <button
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 text-primary-fg-light dark:text-primary-fg-dark rounded-md transition-colors"
            >
                <RotateCcw size={18} />
                New Game
            </button>

            <button
                onClick={undoMove}
                className="flex items-center gap-2 px-4 py-2 bg-secondary-light dark:bg-secondary-dark hover:bg-secondary-light/80 dark:hover:bg-secondary-dark/80 text-secondary-fg-light dark:text-secondary-fg-dark rounded-md transition-colors border border-border-light dark:border-border-dark"
            >
                <Copy size={18} className="rotate-180" /> {/* Simulate Undo Icon */}
                Undo
            </button>

            <button
                onClick={flipBoard}
                className="flex items-center gap-2 px-4 py-2 bg-secondary-light dark:bg-secondary-dark hover:bg-secondary-light/80 dark:hover:bg-secondary-dark/80 text-secondary-fg-light dark:text-secondary-fg-dark rounded-md transition-colors border border-border-light dark:border-border-dark ml-auto"
            >
                <RotateCw size={18} />
                Flip
            </button>
        </div>
    );
}
