"use client";

import { useRouter } from 'next/navigation';
import RankBadge from './RankBadge';

interface Player {
    id: string;
    username: string | null;
    email: string;
    avatar: string | null;
    rating: number;
    wins: number;
    losses: number;
    draws: number;
    totalGames: number;
    lastGameAt: Date | null;
    rank: number;
    winRate: number;
}

interface LeaderboardTableProps {
    players: Player[];
    currentUserId?: string;
    loading?: boolean;
}

export default function LeaderboardTable({ players, currentUserId, loading }: LeaderboardTableProps) {
    const router = useRouter();

    // Get rating color based on value
    const getRatingColor = (rating: number) => {
        if (rating >= 401) return 'text-yellow-600 font-bold';
        if (rating >= 301) return 'text-purple-600 font-semibold';
        if (rating >= 201) return 'text-blue-600 font-semibold';
        if (rating >= 101) return 'text-green-600 font-medium';
        return 'text-gray-600';
    };

    // Get win rate color
    const getWinRateColor = (winRate: number) => {
        if (winRate >= 70) return 'bg-green-500';
        if (winRate >= 50) return 'bg-blue-500';
        if (winRate >= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Format relative time
    const formatRelativeTime = (date: Date | null) => {
        if (!date) return 'Never';

        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 30) return `${diffDays}d ago`;
        return new Date(date).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Games</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-32 bg-gray-200 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-12 bg-gray-200 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-12 bg-gray-200 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-200 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded"></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (players.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
                <p className="text-sm text-gray-500">Try switching to a different time filter</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Games</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {players.map((player) => {
                                const isCurrentUser = currentUserId === player.id;
                                return (
                                    <tr
                                        key={player.id}
                                        onClick={() => router.push(`/profile/${player.id}`)}
                                        className={`cursor-pointer transition-colors ${isCurrentUser
                                                ? 'bg-blue-50 hover:bg-blue-100'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RankBadge rank={player.rank} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {player.avatar ? (
                                                    <img
                                                        src={player.avatar}
                                                        alt={player.username || player.email}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                                                        {(player.username || player.email).charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {player.username || player.email}
                                                        {isCurrentUser && (
                                                            <span className="ml-2 text-xs text-blue-600 font-semibold">(You)</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-lg ${getRatingColor(player.rating)}`}>
                                                {player.rating}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {player.totalGames}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                                                    <div
                                                        className={`h-2 rounded-full ${getWinRateColor(player.winRate)}`}
                                                        style={{ width: `${Math.min(player.winRate, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 w-12">
                                                    {player.winRate.toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <span className="text-green-600 font-medium">{player.wins}</span>
                                            {' - '}
                                            <span className="text-red-600 font-medium">{player.losses}</span>
                                            {' - '}
                                            <span className="text-gray-600">{player.draws}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatRelativeTime(player.lastGameAt)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {players.map((player) => {
                    const isCurrentUser = currentUserId === player.id;
                    return (
                        <div
                            key={player.id}
                            onClick={() => router.push(`/profile/${player.id}`)}
                            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-colors ${isCurrentUser ? 'ring-2 ring-blue-500' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <RankBadge rank={player.rank} size="sm" />
                                {player.avatar ? (
                                    <img
                                        src={player.avatar}
                                        alt={player.username || player.email}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                                        {(player.username || player.email).charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {player.username || player.email}
                                        {isCurrentUser && (
                                            <span className="ml-2 text-xs text-blue-600 font-semibold">(You)</span>
                                        )}
                                    </p>
                                    <p className={`text-lg ${getRatingColor(player.rating)}`}>
                                        {player.rating}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Games:</span>
                                    <span className="ml-1 font-medium">{player.totalGames}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Win Rate:</span>
                                    <span className="ml-1 font-medium">{player.winRate.toFixed(0)}%</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500">Record:</span>
                                    <span className="ml-1">
                                        <span className="text-green-600 font-medium">{player.wins}</span>
                                        {' - '}
                                        <span className="text-red-600 font-medium">{player.losses}</span>
                                        {' - '}
                                        <span className="text-gray-600">{player.draws}</span>
                                    </span>
                                </div>
                                <div className="col-span-2 text-gray-500">
                                    Last active: {formatRelativeTime(player.lastGameAt)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
