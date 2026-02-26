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
            <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Top Players</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3">
                            <div className="w-12 h-8 bg-muted-light dark:bg-muted-dark rounded-full"></div>
                            <div className="w-8 h-8 bg-muted-light dark:bg-muted-dark rounded-full"></div>
                            <div className="flex-1 h-4 bg-muted-light dark:bg-muted-dark rounded"></div>
                            <div className="w-12 h-4 bg-muted-light dark:bg-muted-dark rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-card-fg-light dark:text-card-fg-dark mb-4">Top Players</h3>
                <p className="text-sm text-destructive dark:text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-fg-light dark:text-card-fg-dark">Top Players</h3>
                <Link href="/leaderboard">
                    <div className='text-sm text-muted-fg-light dark:text-muted-fg-dark cursor-pointer'>View more</div>
                </Link>
            </div>

            {players.length === 0 ? (
                <p className="text-sm text-muted-fg-light dark:text-muted-fg-dark">No players yet</p>
            ) : (
                <div >
                    {players.map((player) => (
                        <Link
                            key={player.id}
                            href={`/profile/${player.id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent-light dark:hover:bg-accent-dark transition-colors"
                        >
                            {/* <RankBadge rank={player.rank} size="sm" /> */}

                            {player.avatar ? (
                                <img
                                    src={player.avatar}
                                    alt={player.username || player.email}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-muted-light dark:bg-muted-dark flex items-center justify-center text-muted-fg-light dark:text-muted-fg-dark text-sm font-semibold">
                                    {(player.username || player.email).charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-card-fg-light dark:text-card-fg-dark truncate">
                                    {player.username || player.email}
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
