"use client";

import { Copy, RotateCcw, RotateCw } from "lucide-react"; // Using icons for better UI

import { useGameStore } from "@/store/gameStore";

export function GameControls() {
  const { resetGame, undoMove, flipBoard } = useGameStore();

  return (
    <div className="flex gap-4 rounded-lg border border-border-light bg-card-light p-4 shadow-md dark:border-border-dark dark:bg-card-dark">
      <button
        onClick={resetGame}
        className="flex items-center gap-2 rounded-md bg-primary-light px-4 py-2 text-primary-fg-light transition-colors hover:bg-primary-light/90 dark:bg-primary-dark dark:text-primary-fg-dark dark:hover:bg-primary-dark/90"
      >
        <RotateCcw size={18} />
        New Game
      </button>

      <button
        onClick={undoMove}
        className="flex items-center gap-2 rounded-md border border-border-light bg-secondary-light px-4 py-2 text-secondary-fg-light transition-colors hover:bg-secondary-light/80 dark:border-border-dark dark:bg-secondary-dark dark:text-secondary-fg-dark dark:hover:bg-secondary-dark/80"
      >
        <Copy size={18} className="rotate-180" /> {/* Simulate Undo Icon */}
        Undo
      </button>

      <button
        onClick={flipBoard}
        className="ml-auto flex items-center gap-2 rounded-md border border-border-light bg-secondary-light px-4 py-2 text-secondary-fg-light transition-colors hover:bg-secondary-light/80 dark:border-border-dark dark:bg-secondary-dark dark:text-secondary-fg-dark dark:hover:bg-secondary-dark/80"
      >
        <RotateCw size={18} />
        Flip
      </button>
    </div>
  );
}
