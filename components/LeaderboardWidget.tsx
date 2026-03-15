"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RankBadge } from "./RankBadge";

import { Player } from "@/types/player";

export function LeaderboardWidget() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopPlayers = async () => {
    try {
      const response = await fetch("/api/leaderboard?limit=5&page=1");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await response.json();
      setPlayers(data.players);
      setError(null);
    } catch (err) {
      console.error("Error fetching top players:", err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopPlayers();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTopPlayers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-card border-border rounded-xl border p-6">
        <h3 className="text-card-foreground mb-4 text-lg font-semibold">
          Top Players
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3">
              <div className="h-8 w-12 rounded-full bg-muted-light dark:bg-muted-dark"></div>
              <div className="h-8 w-8 rounded-full bg-muted-light dark:bg-muted-dark"></div>
              <div className="h-4 flex-1 rounded bg-muted-light dark:bg-muted-dark"></div>
              <div className="h-4 w-12 rounded bg-muted-light dark:bg-muted-dark"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border-light bg-card-light p-6 dark:border-border-dark dark:bg-card-dark">
        <h3 className="mb-4 text-lg font-semibold text-card-fg-light dark:text-card-fg-dark">
          Top Players
        </h3>
        <p className="text-sm text-destructive dark:text-destructive">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-light bg-card-light p-6 dark:border-border-dark dark:bg-card-dark">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-fg-light dark:text-card-fg-dark">
          Top Players
        </h3>
        <Link href="/leaderboard">
          <div className="cursor-pointer text-sm text-muted-fg-light dark:text-muted-fg-dark">
            View more
          </div>
        </Link>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
          No players yet
        </p>
      ) : (
        <div>
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/profile/${player.id}`}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent-light dark:hover:bg-accent-dark"
            >
              {/* <RankBadge rank={player.rank} size="sm" /> */}

              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={player.username || player.name || player.email}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-light text-sm font-semibold text-muted-fg-light dark:bg-muted-dark dark:text-muted-fg-dark">
                  {(player.username || player.name || player.email)
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-fg-light dark:text-card-fg-dark">
                  {player.username || player.name || player.email}
                </p>
              </div>

              <div className="text-sm font-semibold text-card-fg-light dark:text-card-fg-dark">
                {player.rating}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
