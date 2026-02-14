'use client';

import { useGameStore } from '@/store/gameStore';
import { RotateCcw, Copy, RotateCw } from 'lucide-react'; // Using icons for better UI

export default function GameControls() {
    const { resetGame, undoMove, flipBoard } = useGameStore();

    return (
        <div className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800">
            <button
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
            >
                <RotateCcw size={18} />
                New Game
            </button>

            <button
                onClick={undoMove}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md transition-colors border border-zinc-200 dark:border-zinc-700"
            >
                <Copy size={18} className="rotate-180" /> {/* Simulate Undo Icon */}
                Undo
            </button>

            <button
                onClick={flipBoard}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md transition-colors border border-zinc-200 dark:border-zinc-700 ml-auto"
            >
                <RotateCw size={18} />
                Flip
            </button>
        </div>
    );
}
