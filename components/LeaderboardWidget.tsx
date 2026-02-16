"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RankBadge from './RankBadge';

interface Player {
    id: string;
    username: string | null;
    email: string;
    avatar: string | null;
    rating: number;
    rank: number;
}

export default function LeaderboardWidget() {
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
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Players</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3">
                            <div className="w-12 h-8 bg-gray-200 rounded-full"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                            <div className="w-12 h-4 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Players</h3>
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Players</h3>
                <span className="text-xs text-gray-500">🏆</span>
            </div>

            {players.length === 0 ? (
                <p className="text-sm text-gray-500">No players yet</p>
            ) : (
                <div className="space-y-3">
                    {players.map((player) => (
                        <Link
                            key={player.id}
                            href={`/profile/${player.id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RankBadge rank={player.rank} size="sm" />

                            {player.avatar ? (
                                <img
                                    src={player.avatar}
                                    alt={player.username || player.email}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-semibold">
                                    {(player.username || player.email).charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {player.username || player.email}
                                </p>
                            </div>

                            <div className="text-sm font-semibold text-gray-900">
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
