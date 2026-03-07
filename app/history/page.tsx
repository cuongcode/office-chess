"use client";

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback,useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';

type ResultFilter = 'all' | 'win' | 'loss' | 'draw';
type SortBy = 'recent' | 'oldest';

interface GamePlayer {
    id: string;
    username: string | null;
    avatar: string | null;
}

interface Game {
    id: string;
    whitePlayerId: string;
    blackPlayerId: string;
    whitePlayer: GamePlayer;
    blackPlayer: GamePlayer;
    result: string;
    resultMethod: string;
    opening: string | null;
    timeControl: string;
    moveCount: number;
    duration: number;
    createdAt: string;
    userResult: 'win' | 'loss' | 'draw';
    userColor: 'white' | 'black';
}

interface Pagination {
    page: number;
    totalPages: number;
    totalGames: number;
    hasMore: boolean;
}

const RESULT_TABS: { label: string; value: ResultFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Wins', value: 'win' },
    { label: 'Losses', value: 'loss' },
    { label: 'Draws', value: 'draw' },
];

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ResultBadge({ result }: { result: 'win' | 'loss' | 'draw' }) {
    const styles = {
        win: 'bg-success/15 text-success border border-success/30',
        loss: 'bg-destructive/15 text-destructive border border-destructive/30',
        draw: 'bg-amber-500/15 text-amber-500 border border-amber-500/30',
    };
    const labels = { win: 'Win', loss: 'Loss', draw: 'Draw' };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[result]}`}>
            {labels[result]}
        </span>
    );
}

function PlayerAvatar({ player, label }: { player: GamePlayer; label: string }) {
    const displayName = player.username || 'Unknown';
    return (
        <div className="flex flex-col items-center gap-1 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-light dark:bg-secondary-dark flex items-center justify-center text-sm font-bold flex-shrink-0 ring-2 ring-border-light dark:ring-border-dark">
                {player.avatar ? (
                    <img src={player.avatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
            </div>
            <span className="text-xs text-muted-fg-light dark:text-muted-fg-dark truncate max-w-[64px]">{label}</span>
        </div>
    );
}

function GameCard({ game, currentUserId, onClick }: { game: Game; currentUserId: string; onClick: () => void }) {
    const isWhite = game.whitePlayerId === currentUserId;
    const you = isWhite ? game.whitePlayer : game.blackPlayer;
    const opponent = isWhite ? game.blackPlayer : game.whitePlayer;

    return (
        <div
            onClick={onClick}
            className="group flex items-center gap-4 p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl cursor-pointer transition-all duration-200 hover:border-primary-light dark:hover:border-primary-dark hover:shadow-hover hover:-translate-y-0.5"
        >
            {/* Players */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <PlayerAvatar player={you} label="You" />
                <span className="text-muted-fg-light dark:text-muted-fg-dark text-sm font-medium">vs</span>
                <PlayerAvatar player={opponent} label={opponent.username || 'Unknown'} />
            </div>

            {/* Center info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <ResultBadge result={game.userResult} />
                    {game.opening && (
                        <span className="text-xs text-muted-fg-light dark:text-muted-fg-dark truncate hidden sm:block">
                            {game.opening}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-fg-light dark:text-muted-fg-dark">
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {game.timeControl === 'unlimited' ? '∞' : game.timeControl}
                    </span>
                    <span className="capitalize text-xs">{game.resultMethod.replace(/_/g, ' ')}</span>
                </div>
            </div>

            {/* Right info */}
            <div className="flex-shrink-0 text-right hidden sm:block">
                <p className="text-xs text-muted-fg-light dark:text-muted-fg-dark mb-0.5">
                    {formatRelativeTime(game.createdAt)}
                </p>
                <p className="text-xs font-medium">
                    {game.moveCount} move{game.moveCount !== 1 ? 's' : ''}
                </p>
            </div>

            {/* View button */}
            <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary-light dark:bg-secondary-dark text-fg-light dark:text-fg-dark group-hover:bg-primary-light group-hover:text-white dark:group-hover:bg-primary-dark transition-colors">
                    View
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="flex items-center gap-4 p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl animate-pulse">
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-secondary-light dark:bg-secondary-dark" />
                <div className="w-4 h-4 bg-secondary-light dark:bg-secondary-dark rounded" />
                <div className="w-10 h-10 rounded-full bg-secondary-light dark:bg-secondary-dark" />
            </div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-24" />
                <div className="h-3 bg-secondary-light dark:bg-secondary-dark rounded w-40" />
            </div>
            <div className="hidden sm:block space-y-1.5">
                <div className="h-3 bg-secondary-light dark:bg-secondary-dark rounded w-20" />
                <div className="h-3 bg-secondary-light dark:bg-secondary-dark rounded w-14" />
            </div>
            <div className="w-16 h-7 bg-secondary-light dark:bg-secondary-dark rounded-lg" />
        </div>
    );
}

export default function HistoryPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();

    const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
    const [sortBy, setSortBy] = useState<SortBy>('recent');
    const [page, setPage] = useState(1);
    const [games, setGames] = useState<Game[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentUserId = (session?.user as any)?.id;

    const fetchGames = useCallback(async () => {
        if (!currentUserId) return;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '20',
                result: resultFilter,
                sortBy,
            });
            const res = await fetch(`/api/games/history?${params}`);
            if (!res.ok) throw new Error('Failed to fetch game history');
            const data = await res.json();
            setGames(data.games);
            setPagination(data.pagination);
        } catch (err) {
            setError('Could not load game history. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [currentUserId, page, resultFilter, sortBy]);

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            fetchGames();
        }
    }, [fetchGames, sessionStatus]);

    const handleFilterChange = (filter: ResultFilter) => {
        setResultFilter(filter);
        setPage(1);
    };

    const handleSortChange = (sort: SortBy) => {
        setSortBy(sort);
        setPage(1);
    };

    if (sessionStatus === 'loading') {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 pt-24 min-h-screen">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-secondary-light dark:bg-secondary-dark rounded w-48" />
                    <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-32" />
                </div>
            </div>
        );
    }

    if (sessionStatus === 'unauthenticated') {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 pt-24 min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="text-5xl">♟️</div>
                <h1 className="font-h2 text-fg-light dark:text-fg-dark">Sign in to view history</h1>
                <p className="text-muted-fg-light dark:text-muted-fg-dark">You need to be logged in to see your game history.</p>
                <Button onClick={() => router.push('/auth/login')}>Sign In</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pt-24 min-h-screen bg-bg-light dark:bg-bg-dark">

            {/* Header */}
            <div className="mb-6">
                <h1 className="font-h1 text-fg-light dark:text-fg-dark">Game History</h1>
                {pagination && (
                    <p className="text-sm text-muted-fg-light dark:text-muted-fg-dark mt-1">
                        {pagination.totalGames.toLocaleString()} game{pagination.totalGames !== 1 ? 's' : ''} played
                    </p>
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Result filter tabs */}
                <div className="flex items-center bg-secondary-light dark:bg-secondary-dark rounded-xl p-1 gap-1">
                    {RESULT_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            id={`filter-${tab.value}`}
                            onClick={() => handleFilterChange(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${resultFilter === tab.value
                                ? 'bg-card-light dark:bg-card-dark text-fg-light dark:text-fg-dark shadow-sm'
                                : 'text-muted-fg-light dark:text-muted-fg-dark hover:text-fg-light dark:hover:text-fg-dark'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Sort dropdown */}
                <div className="ml-auto">
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value as SortBy)}
                        className="px-3 py-2 rounded-xl text-sm font-medium bg-secondary-light dark:bg-secondary-dark text-fg-light dark:text-fg-dark border border-border-light dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark cursor-pointer"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Games List */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : games.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-6xl mb-4">♟️</div>
                    <h2 className="font-h3 text-fg-light dark:text-fg-dark mb-2">No games found</h2>
                    <p className="text-muted-fg-light dark:text-muted-fg-dark mb-6">
                        {resultFilter === 'all'
                            ? "You haven't played any games yet."
                            : `No ${resultFilter}s found. Try a different filter.`}
                    </p>
                    <Button onClick={() => router.push('/')}>
                        {resultFilter === 'all' ? 'Start your first game!' : 'View all games'}
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {games.map((game) => (
                        <GameCard
                            key={game.id}
                            game={game}
                            currentUserId={currentUserId}
                            onClick={() => router.push(`/history/${game.id}`)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl px-6 py-4">
                    <p className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
                        Page <span className="font-semibold text-fg-light dark:text-fg-dark">{pagination.page}</span> of{' '}
                        <span className="font-semibold text-fg-light dark:text-fg-dark">{pagination.totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setPage((p) => p - 1)}
                            disabled={page === 1}
                        >
                            ← Previous
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!pagination.hasMore}
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
