"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface Player {
    id: string;
    username: string | null;
    email: string;
    avatar: string | null;
    rating: number;
    rank: number;
}

interface PlayerSearchBarProps {
    onPlayerSelect?: (playerId: string) => void;
}

export function PlayerSearchBar({ onPlayerSelect }: PlayerSearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    // Debounced search
    const searchPlayers = useCallback(
        async (searchQuery: string) => {
            if (searchQuery.trim().length < 2) {
                setResults([]);
                setShowDropdown(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/leaderboard/search?q=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data.players);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        },
        []
    );

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
        setQuery('');
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
                    className="w-full px-4 py-2 pl-10 border border-input bg-card rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground placeholder:text-sm"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                </div>
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
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

                    <div className="absolute z-20 mt-2 w-full bg-card rounded-xl shadow-lg border border-border max-h-80 overflow-y-auto">
                        {results.map((player) => (
                            <button
                                key={player.id}
                                onClick={() => handlePlayerClick(player.id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                            >
                                {player.avatar ? (
                                    <img
                                        src={player.avatar}
                                        alt={player.username || player.email}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                                        {(player.username || player.email).charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-card-foreground truncate">
                                        {player.username || player.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Rank #{player.rank} • Rating: {player.rating}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* No results message */}
            {showDropdown && query.length >= 2 && !loading && results.length === 0 && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                    ></div>
                    <div className="absolute z-20 mt-2 w-full bg-card rounded-xl shadow-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground text-center">No players found</p>
                    </div>
                </>
            )}
        </div>
    );
}
