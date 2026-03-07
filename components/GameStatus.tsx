"use client";

import { useGameStore } from "@/store/gameStore";

export function GameStatus() {
  const { status, turn, winner } = useGameStore();

  let message = "";
  let subMessage = "";
  let colorClass = "text-fg-light dark:text-fg-dark";

  if (status === "checkmate") {
    message = `Checkmate! ${winner === "w" ? "White" : "Black"} wins.`;
    colorClass = "text-destructive font-bold";
  } else if (status === "draw" || status === "stalemate") {
    message = "Game Over - Draw";
    subMessage =
      status === "stalemate"
        ? "(Stalemate)"
        : "(Insufficient Material/Repetition)";
    colorClass = "text-amber-600 dark:text-amber-400 font-bold";
  } else if (status === "check") {
    message = `${turn === "w" ? "White" : "Black"} is in Check!`;
    colorClass = "text-orange-600 dark:text-orange-400 font-bold animate-pulse";
  } else {
    message = `${turn === "w" ? "White" : "Black"} to move`;
  }

  return (
    <div
      className={`mb-4 rounded-lg border border-border-light bg-card-light p-4 text-center shadow-sm dark:border-border-dark dark:bg-card-dark ${status === "checkmate" ? "ring-2 ring-destructive dark:ring-destructive" : ""}`}
    >
      <h2 className={`text-xl ${colorClass}`}>{message}</h2>
      {subMessage && (
        <p className="mt-1 text-sm text-muted-fg-light dark:text-muted-fg-dark">
          {subMessage}
        </p>
      )}
    </div>
  );
}
