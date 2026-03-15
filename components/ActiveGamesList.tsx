"use client";

import { ArrowRight, Eye, RefreshCw, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useGameStore } from "@/store/gameStore";
import { Button } from "./ui";

interface ActiveGame {
  roomId: string;
  whitePlayer: string;
  blackPlayer: string;
  spectatorCount: number;
  status: string;
}

interface ActiveGamesListProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export function ActiveGamesList({
  userId,
  userName,
  onClose,
}: ActiveGamesListProps) {
  const [games, setGames] = useState<ActiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { spectateGame } = useGameStore();

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/games/active");
      const data = await res.json();
      setGames(data);
    } catch (error) {
      console.error("Failed to fetch active games:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSpectate = (roomId: string) => {
    spectateGame(roomId, userId, userName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-border-light bg-card-light p-8 text-card-fg-light shadow-xl dark:border-border-dark dark:bg-card-dark dark:text-card-fg-dark">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="mb-6 flex items-center gap-6">
          <h2 className="text-2xl font-bold">Active Games</h2>
          <Button
            variant="secondary"
            size="icon"
            onClick={fetchGames}
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {games.length === 0 && !loading ? (
            <div className="py-12 text-center text-muted-fg-light dark:text-muted-fg-dark">
              No active games found. Create one!
            </div>
          ) : (
            games.map((game) => (
              <div
                key={game.roomId}
                className="flex items-center justify-between rounded-xl border border-border-light bg-muted-light/30 p-4 transition-colors hover:border-muted-fg-light/30 dark:border-border-dark dark:bg-muted-dark/30 dark:hover:border-muted-fg-dark/30"
              >
                <div className="flex flex-col">
                  <div className="mb-1 flex items-center gap-2 text-lg font-bold">
                    <span className="text-card-fg-light dark:text-card-fg-dark">
                      {game.whitePlayer}
                    </span>
                    <span className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
                      vs
                    </span>
                    <span className="text-card-fg-light dark:text-card-fg-dark">
                      {game.blackPlayer}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-fg-light dark:text-muted-fg-dark">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> Room: {game.roomId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {game.spectatorCount}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${game.status === "playing" ? "bg-success/20 text-success" : "bg-muted-light text-muted-fg-light dark:bg-muted-dark dark:text-muted-fg-dark"}`}
                    >
                      {game.status}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleSpectate(game.roomId)}
                  size="sm"
                  className="gap-2"
                >
                  Watch <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
