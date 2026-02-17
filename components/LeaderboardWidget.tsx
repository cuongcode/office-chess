"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RankBadge } from "./RankBadge";

interface Player {
    id: string;
    username: string | null;
    email: string;
    avatar: string | null;
    rating: number;
    rank: number;
}

export function LeaderboardWidget() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopPlayers = async () => {
        try {
            const response = await fetch('/api/leaderboard?limit=5&page=1');
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            const data = await response.json();
            setPlayers(data.players);
            setError(null);
        } catch (err) {
            console.error('Error fetching top players:', err);
            setError('Failed to load leaderboard');
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
            <div className="bg-card rounded-lg shadow p-6 border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Top Players</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3">
                            <div className="w-12 h-8 bg-muted rounded-full"></div>
                            <div className="w-8 h-8 bg-muted rounded-full"></div>
                            <div className="flex-1 h-4 bg-muted rounded"></div>
                            <div className="w-12 h-4 bg-muted rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card rounded-lg shadow p-6 border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Top Players</h3>
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg shadow p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">Top Players</h3>
                <span className="text-xs text-muted-foreground">🏆</span>
            </div>

            {players.length === 0 ? (
                <p className="text-sm text-muted-foreground">No players yet</p>
            ) : (
                <div className="space-y-3">
                    {players.map((player) => (
                        <Link
                            key={player.id}
                            href={`/profile/${player.id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                            <RankBadge rank={player.rank} size="sm" />

                            {player.avatar ? (
                                <img
                                    src={player.avatar}
                                    alt={player.username || player.email}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-semibold">
                                    {(player.username || player.email).charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-card-foreground truncate">
                                    {player.username || player.email}
                                </p>
                            </div>

                            <div className="text-sm font-semibold text-card-foreground">
                                {player.rating}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Link
                href="/leaderboard"
                className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
                View Full Leaderboard →
            </Link>
        </div>
    );
}
