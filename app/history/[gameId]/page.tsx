'use client';

import { Chess } from 'chess.js';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useCallback,useEffect, useState } from 'react';

const Chessboard = dynamic(
    () => import('react-chessboard').then((mod) => mod.Chessboard),
    {
        ssr: false,
        loading: () => (
            <div className="w-full aspect-square rounded-xl bg-secondary-light dark:bg-secondary-dark animate-pulse" />
        ),
    }
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface GamePlayer {
    id: string;
    username: string | null;
    avatar: string | null;
}

interface GameData {
    id: string;
    whitePlayerId: string;
    blackPlayerId: string;
    whitePlayer: GamePlayer;
    blackPlayer: GamePlayer;
    result: string;
    resultMethod: string;
    movesArray: string[];
    movesPGN: string;
    finalPosition: string;
    moveCount: number;
    timeControl: string;
    duration: number;
    opening: string | null;
    createdAt: string;
    endedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function getResultLabel(result: string): { text: string; colorClass: string } {
    switch (result) {
        case 'white_win': return { text: 'White Wins', colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300 dark:border-amber-700' };
        case 'black_win': return { text: 'Black Wins', colorClass: 'bg-slate-700 text-slate-100 dark:bg-slate-800 dark:text-slate-200 border border-slate-500' };
        case 'draw': return { text: 'Draw', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-700' };
        default: return { text: result, colorClass: 'bg-secondary-light dark:bg-secondary-dark text-fg-light dark:text-fg-dark' };
    }
}

function formatResultMethod(method: string): string {
    return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlayerAvatar({ player }: { player: GamePlayer }) {
    const name = player.username || 'Unknown';
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-light dark:bg-secondary-dark flex items-center justify-center text-base font-bold flex-shrink-0 ring-2 ring-border-light dark:ring-border-dark">
                {player.avatar ? (
                    <img src={player.avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-fg-light dark:text-fg-dark">{name.charAt(0).toUpperCase()}</span>
                )}
            </div>
            <span className="text-sm font-semibold text-fg-light dark:text-fg-dark max-w-[80px] truncate text-center">{name}</span>
        </div>
    );
}

function NavButton({
    onClick,
    disabled,
    title,
    children,
}: {
    onClick: () => void;
    disabled: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-secondary-light dark:bg-secondary-dark text-fg-light dark:text-fg-dark border border-border-light dark:border-border-dark hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 text-lg font-bold select-none"
        >
            {children}
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GameReplayPage() {
    const params = useParams();
    const router = useRouter();
    const gameId = params?.gameId as string;

    const [game, setGame] = useState<GameData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [currentFEN, setCurrentFEN] = useState(STARTING_FEN);

    // Fetch game data
    useEffect(() => {
        if (!gameId) return;
        setLoading(true);
        fetch(`/api/games/${gameId}`)
            .then((res) => {
                if (res.status === 404) throw new Error('Game not found');
                if (!res.ok) throw new Error('Failed to load game');
                return res.json();
            })
            .then((data: GameData) => {
                setGame(data);
                // Start at position 0 (before any moves)
                setCurrentFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                setCurrentMoveIndex(0);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [gameId]);

    // Navigate to a specific move index (0 = start, n = after n moves)
    const goToMove = useCallback(
        (index: number) => {
            if (!game) return;
            const moves = game.movesArray as string[];
            const clamped = Math.max(0, Math.min(index, moves.length));
            const chess = new Chess();
            for (let i = 0; i < clamped; i++) {
                chess.move(moves[i]);
            }
            setCurrentFEN(chess.fen());
            setCurrentMoveIndex(clamped);
        },
        [game]
    );

    const goToStart = useCallback(() => goToMove(0), [goToMove]);
    const goToPrev = useCallback(() => goToMove(currentMoveIndex - 1), [goToMove, currentMoveIndex]);
    const goToNext = useCallback(() => goToMove(currentMoveIndex + 1), [goToMove, currentMoveIndex]);
    const goToEnd = useCallback(() => game && goToMove(game.movesArray.length), [goToMove, game]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Don't intercept if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrev(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); goToNext(); }
            else if (e.key === 'Home') { e.preventDefault(); goToStart(); }
            else if (e.key === 'End') { e.preventDefault(); goToEnd(); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goToPrev, goToNext, goToStart, goToEnd]);

    // ─── Loading ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-muted-fg-light dark:text-muted-fg-dark">
                    <div className="w-10 h-10 border-2 border-primary-light dark:border-primary-dark border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Loading replay…</p>
                </div>
            </div>
        );
    }

    // ─── Error ────────────────────────────────────────────────────────────────
    if (error || !game) {
        return (
            <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-20 flex flex-col items-center justify-center gap-4 px-4">
                <div className="text-6xl">♟️</div>
                <h1 className="font-h2 text-fg-light dark:text-fg-dark text-center">
                    {error === 'Game not found' ? 'Game Not Found' : 'Failed to Load Game'}
                </h1>
                <p className="text-muted-fg-light dark:text-muted-fg-dark text-center max-w-sm">
                    {error === 'Game not found'
                        ? 'This game doesn\'t exist or may have been deleted.'
                        : 'Something went wrong while loading the game. Please try again.'}
                </p>
                <button
                    onClick={() => router.push('/history')}
                    className="px-6 py-2.5 rounded-xl bg-primary-light dark:bg-primary-dark text-white font-semibold hover:opacity-90 transition-opacity"
                >
                    ← Back to History
                </button>
            </div>
        );
    }

    // ─── Derived data ─────────────────────────────────────────────────────────
    const moves = game.movesArray as string[];
    const totalMoves = moves.length;
    const resultInfo = getResultLabel(game.result);

    // Build paired move rows for the move list
    const moveRows: { number: number; white: string; whiteIdx: number; black: string; blackIdx: number }[] = [];
    for (let i = 0; i < totalMoves; i += 2) {
        moveRows.push({
            number: Math.floor(i / 2) + 1,
            white: moves[i],
            whiteIdx: i + 1,    // after white's move, index = i+1
            black: moves[i + 1] || '',
            blackIdx: i + 2,    // after black's move, index = i+2
        });
    }

    const atStart = currentMoveIndex === 0;
    const atEnd = currentMoveIndex === totalMoves;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark pt-16">
            <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">

                {/* Back Link */}
                <button
                    onClick={() => router.push('/history')}
                    className="self-start flex items-center gap-1.5 text-sm text-muted-fg-light dark:text-muted-fg-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to History
                </button>

                {/* Main layout: board + info side by side on Desktop, stacked on Mobile */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ── LEFT: Board + Controls ───────────────────────────── */}
                    <div className="flex flex-col gap-4 w-full lg:w-auto">
                        {/* Board */}
                        <div className="w-full max-w-[520px] mx-auto lg:mx-0">
                            <div className="w-full aspect-square rounded-lg overflow-hidden border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
                                <Chessboard
                                    options={{
                                        id: 'ReplayBoard',
                                        position: currentFEN,
                                        allowDragging: false,
                                        animationDurationInMs: 150,
                                        darkSquareStyle: { backgroundColor: 'var(--color-board-dark-light)' },
                                        lightSquareStyle: { backgroundColor: 'var(--color-board-light-light)' },
                                    }}
                                />
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex items-center justify-center gap-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl px-4 py-3 shadow-sm max-w-[520px] mx-auto lg:mx-0 w-full">
                            <NavButton onClick={goToStart} disabled={atStart} title="Go to start (Home)">
                                ⏮
                            </NavButton>
                            <NavButton onClick={goToPrev} disabled={atStart} title="Previous move (←)">
                                ◀
                            </NavButton>

                            {/* Move counter */}
                            <div className="flex-1 text-center text-sm text-muted-fg-light dark:text-muted-fg-dark select-none">
                                <span className="font-semibold text-fg-light dark:text-fg-dark">{currentMoveIndex}</span>
                                <span className="mx-1">/</span>
                                <span>{totalMoves}</span>
                            </div>

                            <NavButton onClick={goToNext} disabled={atEnd} title="Next move (→)">
                                ▶
                            </NavButton>
                            <NavButton onClick={goToEnd} disabled={atEnd} title="Go to end (End)">
                                ⏭
                            </NavButton>
                        </div>

                        {/* Keyboard hint */}
                        <p className="text-center text-xs text-muted-fg-light dark:text-muted-fg-dark max-w-[520px] mx-auto lg:mx-0 w-full">
                            Use <kbd className="px-1.5 py-0.5 rounded bg-secondary-light dark:bg-secondary-dark font-mono text-[10px]">←</kbd>{' '}
                            <kbd className="px-1.5 py-0.5 rounded bg-secondary-light dark:bg-secondary-dark font-mono text-[10px]">→</kbd>{' '}
                            arrow keys · <kbd className="px-1.5 py-0.5 rounded bg-secondary-light dark:bg-secondary-dark font-mono text-[10px]">Home</kbd>{' '}
                            <kbd className="px-1.5 py-0.5 rounded bg-secondary-light dark:bg-secondary-dark font-mono text-[10px]">End</kbd> to navigate
                        </p>
                    </div>

                    {/* ── RIGHT: Game Info Panel ───────────────────────────── */}
                    <div className="flex flex-col gap-4 flex-1 w-full min-w-0">

                        {/* Header: Players + Result */}
                        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                {/* White */}
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-fg-light dark:text-muted-fg-dark mb-1">White</span>
                                    <PlayerAvatar player={game.whitePlayer} />
                                </div>

                                {/* VS + Result */}
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${resultInfo.colorClass}`}>
                                        {resultInfo.text}
                                    </span>
                                    <span className="text-xl font-bold text-muted-fg-light dark:text-muted-fg-dark">vs</span>
                                    <span className="text-xs text-muted-fg-light dark:text-muted-fg-dark">{formatDate(game.createdAt)}</span>
                                </div>

                                {/* Black */}
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-fg-light dark:text-muted-fg-dark mb-1">Black</span>
                                    <PlayerAvatar player={game.blackPlayer} />
                                </div>
                            </div>
                        </div>

                        {/* Game Details */}
                        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-fg-light dark:text-muted-fg-dark mb-3">Game Details</h3>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                                {game.opening && (
                                    <>
                                        <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark col-span-2 sm:col-span-1">Opening</dt>
                                        <dd className="text-sm font-medium text-fg-light dark:text-fg-dark col-span-2 sm:col-span-1 truncate" title={game.opening}>{game.opening}</dd>
                                    </>
                                )}
                                <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">Time Control</dt>
                                <dd className="text-sm font-medium text-fg-light dark:text-fg-dark">
                                    {game.timeControl === 'unlimited' ? '∞ Unlimited' : game.timeControl}
                                </dd>
                                <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">Total Moves</dt>
                                <dd className="text-sm font-medium text-fg-light dark:text-fg-dark">{totalMoves}</dd>
                                <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">Duration</dt>
                                <dd className="text-sm font-medium text-fg-light dark:text-fg-dark">{formatDuration(game.duration)}</dd>
                                <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">Result</dt>
                                <dd className="text-sm font-medium text-fg-light dark:text-fg-dark capitalize">{formatResultMethod(game.resultMethod)}</dd>
                            </dl>
                        </div>

                        {/* Move List */}
                        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm flex flex-col min-h-0">
                            <div className="px-5 py-3 border-b border-border-light dark:border-border-dark">
                                <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-fg-light dark:text-muted-fg-dark">Move List</h3>
                            </div>

                            {moveRows.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-muted-fg-light dark:text-muted-fg-dark text-sm italic">
                                    No moves recorded
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-64 lg:max-h-80">
                                    {/* Column headers */}
                                    <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-x-1 px-3 py-2 border-b border-border-light dark:border-border-dark bg-secondary-light/50 dark:bg-secondary-dark/30 sticky top-0">
                                        <span className="text-xs font-semibold text-muted-fg-light dark:text-muted-fg-dark">#</span>
                                        <span className="text-xs font-semibold text-muted-fg-light dark:text-muted-fg-dark">White</span>
                                        <span className="text-xs font-semibold text-muted-fg-light dark:text-muted-fg-dark">Black</span>
                                    </div>

                                    {moveRows.map((row) => {
                                        const whiteActive = currentMoveIndex === row.whiteIdx;
                                        const blackActive = currentMoveIndex === row.blackIdx;
                                        return (
                                            <div key={row.number} className="grid grid-cols-[2.5rem_1fr_1fr] gap-x-1 px-3">
                                                {/* Move number */}
                                                <span className="py-1.5 text-xs text-muted-fg-light dark:text-muted-fg-dark font-mono self-center">
                                                    {row.number}.
                                                </span>

                                                {/* White move */}
                                                <button
                                                    onClick={() => goToMove(row.whiteIdx)}
                                                    className={`py-1.5 px-2 rounded-lg text-sm font-mono text-left transition-colors duration-100 ${whiteActive
                                                        ? 'bg-primary-light dark:bg-primary-dark text-white font-semibold'
                                                        : 'text-fg-light dark:text-fg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark'
                                                        }`}
                                                >
                                                    {row.white}
                                                </button>

                                                {/* Black move */}
                                                {row.black ? (
                                                    <button
                                                        onClick={() => goToMove(row.blackIdx)}
                                                        className={`py-1.5 px-2 rounded-lg text-sm font-mono text-left transition-colors duration-100 ${blackActive
                                                            ? 'bg-primary-light dark:bg-primary-dark text-white font-semibold'
                                                            : 'text-fg-light dark:text-fg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark'
                                                            }`}
                                                    >
                                                        {row.black}
                                                    </button>
                                                ) : (
                                                    <span />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
