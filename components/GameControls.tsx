"use client";

import { Copy, RotateCcw, RotateCw } from "lucide-react"; // Using icons for better UI

import { useGameStore } from "@/store/gameStore";
import { Button } from "./ui";

export function GameControls() {
  const { resetGame, undoMove, flipBoard } = useGameStore();

  return (
    <div className="flex gap-4 rounded-lg border border-border-light bg-card-light p-4 shadow-md dark:border-border-dark dark:bg-card-dark">
      <Button
        onClick={resetGame}
        size="sm"
        className="flex items-center gap-2"
      >
        <RotateCcw size={18} />
        New Game
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={undoMove}
        className="flex items-center gap-2"
      >
        <Copy size={18} className="rotate-180" /> {/* Simulate Undo Icon */}
        Undo
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={flipBoard}
        className="ml-auto flex items-center gap-2"
      >
        <RotateCw size={18} />
        Flip
      </Button>
    </div>
  );
}
