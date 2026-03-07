"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PlayerSearchBar } from "@/components/PlayerSearchBar";
import { RankBadge } from "@/components/RankBadge";
import { Button } from "@/components/ui/Button";

type TimeFilter = 'all-time' | 'monthly' | 'weekly';

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

interface LeaderboardStats {
    totalPlayers: number;
    totalGames: number;
    averageRating: number;
    mostActivePlayer: {
        username: string | null;
        totalGames: number;
    } | null;
    highestRatedPlayer: {
        username: string | null;
        rating: number;
    } | null;
}

interface UserRank {
    rank: number;
    totalPlayers: number;
    percentile: number;
}

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const [filter, setFilter] = useState<TimeFilter>('all-time');
    const [page, setPage] = useState(1);
    const [players, setPlayers] = useState<Player[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<LeaderboardStats | null>(null);
    const [userRank, setUserRank] = useState<UserRank | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const limit = 20;

    // Load filter from localStorage
    useEffect(() => {
        const savedFilter = localStorage.getItem('leaderboard_filter');
        if (savedFilter && ['all-time', 'monthly', 'weekly'].includes(savedFilter)) {
            setFilter(savedFilter as TimeFilter);
        }
    }, []);

    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/leaderboard?filter=${filter}&page=${page}&limit=${limit}`);
            if (response.ok) {
                const data = await response.json();
                setPlayers(data.players);
                setTotalPages(data.pagination.totalPages);
                setTotalPlayers(data.pagination.totalPlayers);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await fetch('/api/leaderboard?limit=1&page=1');
            if (response.ok) {
                const data = await response.json();
                // We'll need to create a stats endpoint, but for now use placeholder
                setStats({
                    totalPlayers: data.pagination.totalPlayers,
                    totalGames: 0,
                    averageRating: 0,
                    mostActivePlayer: null,
                    highestRatedPlayer: null,
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Fetch user rank
    const fetchUserRank = async () => {
        if (!session?.user) return;

        try {
            const response = await fetch(`/api/leaderboard/my-rank?filter=${filter}`);
            if (response.ok) {
                const data = await response.json();
                setUserRank(data);
            }
        } catch (error) {
            console.error('Error fetching user rank:', error);
        }
    };

    // Fetch data when filter or page changes
    useEffect(() => {
        fetchLeaderboard();
        fetchStats();
        if (session?.user) {
            fetchUserRank();
        }
    }, [filter, page, session]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLeaderboard();
            if (session?.user) {
                fetchUserRank();
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [filter, page, session]);

    // Save filter to localStorage
    const handleFilterChange = (newFilter: TimeFilter) => {
        setFilter(newFilter);
        setPage(1);
        localStorage.setItem('leaderboard_filter', newFilter);
    };

    // Format relative time
    const formatLastUpdated = () => {
        const now = new Date();
        const diffMs = now.getTime() - lastUpdated.getTime();
        const diffSecs = Math.floor(diffMs / 1000);

        if (diffSecs < 10) return 'Updated just now';
        if (diffSecs < 60) return `Updated ${diffSecs}s ago`;
        return `Updated ${Math.floor(diffSecs / 60)}m ago`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-6 min-h-screen max-h-screen bg-bg-light dark:bg-bg-dark pt-24">
            {/* Header */}
            <div className="">
                <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
                <p className="text-sm text-muted-fg-light dark:text-muted-fg-dark mt-1">{formatLastUpdated()}</p>
            </div>

            {/* Filter Tabs */}
            <nav className="flex justify-between md:justify-start md:space-x-4">
                <Button
                    variant="secondary"
                    onClick={() => handleFilterChange('all-time')}
                >
                    All Time
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => handleFilterChange('monthly')}
                >
                    This Month
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => handleFilterChange('weekly')}
                >
                    This Week
                </Button>
            </nav>

            {/* Statistics Summary */}
            {/* {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-card rounded-lg shadow p-6">
                            <div className="text-sm text-[var(--text-muted)] mb-1">Total Players</div>
                            <div className="text-3xl font-bold">{stats.totalPlayers.toLocaleString()}</div>
                        </div>
                        <div className="bg-card rounded-lg shadow p-6">
                            <div className="text-sm text-[var(--text-muted)] mb-1">Active in {filter === 'weekly' ? 'Week' : filter === 'monthly' ? 'Month' : 'All Time'}</div>
                            <div className="text-3xl font-bold">{totalPlayers.toLocaleString()}</div>
                        </div>
                        <div className="bg-card rounded-lg shadow p-6">
                            <div className="text-sm text-[var(--text-muted)] mb-1">Showing</div>
                            <div className="text-3xl font-bold">
                                {((page - 1) * limit + 1).toLocaleString()}-{Math.min(page * limit, totalPlayers).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )} */}

            {/* Current User Rank Card */}
            {session?.user && userRank && (
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Your Rank</h3>
                            <div className="flex items-center gap-3">
                                <div className="bg-bg-light dark:bg-bg-dark text-primary-light dark:text-primary-light px-4 py-2 rounded-lg font-bold text-xl">
                                    #{userRank.rank}
                                </div>
                                <div>
                                    <p className="text-sm">of {userRank.totalPlayers.toLocaleString()} players</p>
                                    <p className="text-sm font-semibold">Top {userRank.percentile.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm mb-1">Your Stats</p>
                            <p className="text-2xl font-bold">{(session.user as any).rating || 0}</p>
                            <p className="text-sm">Rating</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
            <LeaderboardTable
                players={players}
                currentUserId={(session?.user as any)?.id}
                loading={loading}
            />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex flex-col gap-2 md:flex-row items-center md:justify-between bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg px-6 py-4">
                    <div className="text-sm">
                        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(page * limit, totalPlayers)}</span> of{' '}
                        <span className="font-medium">{totalPlayers.toLocaleString()}</span> players
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <Button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        // className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === 1
                        //     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        //     : 'bg-blue-600 text-white hover:bg-blue-700'
                        //     }`}
                        >
                            Previous
                        </Button>
                        <div className="text-sm">
                            Page <span className="font-medium">{page}</span> of{' '}
                            <span className="font-medium">{totalPages}</span>
                        </div>
                        <Button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                        // className={`px-4 py-2 rounded-lg font-medium transition-colors ${page === totalPages
                        //     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        //     : 'bg-blue-600 text-white hover:bg-blue-700'
                        //     }`}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
