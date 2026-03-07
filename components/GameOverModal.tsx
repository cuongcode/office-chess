"use client";

import { Handshake, Home, Trophy } from "lucide-react";

import { useGameStore } from "@/store/gameStore";

interface GameOverModalProps {
  onReturnHome: () => void;
}

export function GameOverModal({ onReturnHome }: GameOverModalProps) {
  const { status, winner, playerColor, isOnline, leaveGame } = useGameStore();

  if (status === "playing" || status === "check") return null;

  const isWinner =
    winner &&
    playerColor &&
    ((winner === "w" && playerColor === "white") ||
      (winner === "b" && playerColor === "black"));

  const isSpectator = playerColor === "spectator";

  const getTitle = () => {
    if (status === "checkmate") {
      if (isOnline && !isSpectator) {
        return isWinner ? "You Won!" : "You Lost";
      }
      return winner === "w" ? "White Wins!" : "Black Wins!";
    }
    if (status === "draw") return "Draw";
    if (status === "stalemate") return "Stalemate";
    if (status === "resignation") {
      if (isOnline && !isSpectator) {
        return isWinner ? "Opponent Resigned" : "You Resigned";
      }
      return winner === "w"
        ? "White Wins (Resignation)"
        : "Black Wins (Resignation)";
    }
    return "Game Over";
  };

  const getSubtitle = () => {
    if (status === "checkmate") return "by checkmate";
    if (status === "draw") return "by agreement";
    if (status === "stalemate") return "no legal moves";
    if (status === "resignation") return "by resignation";
    return "";
  };

  const handleReturn = () => {
    if (isOnline) {
      leaveGame();
    }
    onReturnHome();
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in w-full duration-300">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-light bg-card-light px-4 py-3 text-card-fg-light shadow-lg dark:border-border-dark dark:bg-card-dark dark:text-card-fg-dark">
        <div className="flex min-w-0 items-center gap-3">
          {status === "checkmate" || status === "resignation" ? (
            <Trophy
              className={`h-5 w-5 flex-shrink-0 ${
                (isWinner || isSpectator || !isOnline) && winner
                  ? "text-yellow-500"
                  : "text-muted-fg-light dark:text-muted-fg-dark"
              }`}
            />
          ) : (
            <Handshake className="h-5 w-5 flex-shrink-0 text-muted-fg-light dark:text-muted-fg-dark" />
          )}
          <div className="min-w-0">
            <p className="text-sm leading-tight font-bold">{getTitle()}</p>
            {getSubtitle() && (
              <p className="text-xs leading-tight text-muted-fg-light dark:text-muted-fg-dark">
                {getSubtitle()}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleReturn}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-muted-light px-3 py-1.5 text-xs font-semibold text-fg-light transition-colors hover:bg-accent-light dark:bg-muted-dark dark:text-fg-dark dark:hover:bg-accent-dark"
        >
          <Home className="h-3.5 w-3.5" />
          Leave
        </button>
      </div>
    </div>
  );
}
