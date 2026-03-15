"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Player } from "@/types/player";
import { Button } from "./ui";

interface PlayerSearchBarProps {
  onPlayerSelect?: (playerId: string) => void;
}

export function PlayerSearchBar({ onPlayerSelect }: PlayerSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // Debounced search
  const searchPlayers = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/leaderboard/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.players);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce timer
  const handleInputChange = (value: string) => {
    setQuery(value);

    // Clear previous timeout
    const timeoutId = setTimeout(() => {
      searchPlayers(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handlePlayerClick = (playerId: string) => {
    setShowDropdown(false);
    setQuery("");
    setResults([]);

    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    } else {
      router.push(`/profile/${playerId}`);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Search other players"
          className="w-full rounded-lg border border-border-light bg-card-light p-2 pl-10 text-fg-light placeholder:text-sm placeholder:text-muted-fg-light dark:border-border-dark dark:bg-card-dark dark:text-fg-dark dark:placeholder:text-muted-fg-dark"
        />
        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-fg-light dark:text-muted-fg-dark">
          <Search className="h-4 w-4" />
        </div>
        {loading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          ></div>

          <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
            {results.map((player) => (
              <Button
                variant="unstyled"
                size="none"
                key={player.id}
                onClick={() => handlePlayerClick(player.id)}
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted-light dark:hover:bg-muted-dark cursor-pointer"
              >
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={player.username || player.name || player.email}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted-light font-semibold text-muted-fg-light dark:bg-muted-dark dark:text-muted-fg-dark">
                    {(player.username || player.name || player.email).charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-fg-light dark:text-card-fg-dark">
                    {player.username || player.name || player.email}
                  </p>
                  <p className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
                    Rank #{player.rank} • Rating: {player.rating}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </>
      )}

      {/* No results message */}
      {showDropdown &&
        query.length >= 2 &&
        !loading &&
        results.length === 0 && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            ></div>
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-border-light bg-card-light p-4 shadow-lg dark:border-border-dark dark:bg-card-dark">
              <p className="text-center text-sm text-muted-fg-light dark:text-muted-fg-dark">
                No players found
              </p>
            </div>
          </>
        )}
    </div>
  );
}
