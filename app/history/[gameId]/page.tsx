"use client";

import { Chess } from "chess.js";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-full animate-pulse rounded-xl bg-secondary-light dark:bg-secondary-dark" />
    ),
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface GamePlayer {
  id: string;
  username: string | null;
  name: string | null;
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
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getResultLabel(result: string): { text: string; colorClass: string } {
  switch (result) {
    case "white_win":
      return {
        text: "White Wins",
        colorClass:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300 dark:border-amber-700",
      };
    case "black_win":
      return {
        text: "Black Wins",
        colorClass:
          "bg-slate-700 text-slate-100 dark:bg-slate-800 dark:text-slate-200 border border-slate-500",
      };
    case "draw":
      return {
        text: "Draw",
        colorClass:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-700",
      };
    default:
      return {
        text: result,
        colorClass:
          "bg-secondary-light dark:bg-secondary-dark text-fg-light dark:text-fg-dark",
      };
  }
}

function formatResultMethod(method: string): string {
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlayerAvatar({ player }: { player: GamePlayer }) {
  const name = player.username || player.name || "Unknown";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-light text-base font-bold ring-2 ring-border-light dark:bg-secondary-dark dark:ring-border-dark">
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-fg-light dark:text-fg-dark">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="max-w-[80px] truncate text-center text-sm font-semibold text-fg-light dark:text-fg-dark">
        {name}
      </span>
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
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-light bg-secondary-light text-lg font-bold text-fg-light transition-all duration-150 select-none hover:bg-primary-light hover:text-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-border-dark dark:bg-secondary-dark dark:text-fg-dark dark:hover:bg-primary-dark dark:hover:text-white"
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
  const STARTING_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [currentFEN, setCurrentFEN] = useState(STARTING_FEN);

  // Fetch game data
  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    fetch(`/api/games/${gameId}`)
      .then((res) => {
        if (res.status === 404) throw new Error("Game not found");
        if (!res.ok) throw new Error("Failed to load game");
        return res.json();
      })
      .then((data: GameData) => {
        setGame(data);
        // Start at position 0 (before any moves)
        setCurrentFEN(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );
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
    [game],
  );

  const goToStart = useCallback(() => goToMove(0), [goToMove]);
  const goToPrev = useCallback(
    () => goToMove(currentMoveIndex - 1),
    [goToMove, currentMoveIndex],
  );
  const goToNext = useCallback(
    () => goToMove(currentMoveIndex + 1),
    [goToMove, currentMoveIndex],
  );
  const goToEnd = useCallback(
    () => game && goToMove(game.movesArray.length),
    [goToMove, game],
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToStart();
      } else if (e.key === "End") {
        e.preventDefault();
        goToEnd();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToPrev, goToNext, goToStart, goToEnd]);

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light pt-20 dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-4 text-muted-fg-light dark:text-muted-fg-dark">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-light border-t-transparent dark:border-primary-dark" />
          <p className="text-sm">Loading replay…</p>
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error || !game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-light px-4 pt-20 dark:bg-bg-dark">
        <div className="text-6xl">♟️</div>
        <h1 className="text-center font-h2 text-fg-light dark:text-fg-dark">
          {error === "Game not found"
            ? "Game Not Found"
            : "Failed to Load Game"}
        </h1>
        <p className="max-w-sm text-center text-muted-fg-light dark:text-muted-fg-dark">
          {error === "Game not found"
            ? "This game doesn't exist or may have been deleted."
            : "Something went wrong while loading the game. Please try again."}
        </p>
        <button
          onClick={() => router.push("/history")}
          className="rounded-xl bg-primary-light px-6 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 dark:bg-primary-dark"
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
  const moveRows: {
    number: number;
    white: string;
    whiteIdx: number;
    black: string;
    blackIdx: number;
  }[] = [];
  for (let i = 0; i < totalMoves; i += 2) {
    moveRows.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIdx: i + 1, // after white's move, index = i+1
      black: moves[i + 1] || "",
      blackIdx: i + 2, // after black's move, index = i+2
    });
  }

  const atStart = currentMoveIndex === 0;
  const atEnd = currentMoveIndex === totalMoves;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-light pt-16 dark:bg-bg-dark">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        {/* Back Link */}
        <button
          onClick={() => router.push("/history")}
          className="flex items-center gap-1.5 self-start text-sm text-muted-fg-light transition-colors hover:text-primary-light dark:text-muted-fg-dark dark:hover:text-primary-dark"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to History
        </button>

        {/* Main layout: board + info side by side on Desktop, stacked on Mobile */}
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          {/* ── LEFT: Board + Controls ───────────────────────────── */}
          <div className="flex w-full flex-col gap-4 lg:w-auto">
            {/* Board */}
            <div className="mx-auto w-full max-w-[520px] lg:mx-0">
              <div className="aspect-square w-full overflow-hidden rounded-lg border border-border-light bg-card-light dark:border-border-dark dark:bg-card-dark">
                <Chessboard
                  options={{
                    id: "ReplayBoard",
                    position: currentFEN,
                    allowDragging: false,
                    animationDurationInMs: 150,
                    darkSquareStyle: {
                      backgroundColor: "var(--color-board-dark-light)",
                    },
                    lightSquareStyle: {
                      backgroundColor: "var(--color-board-light-light)",
                    },
                  }}
                />
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="mx-auto flex w-full max-w-[520px] items-center justify-center gap-2 rounded-2xl border border-border-light bg-card-light px-4 py-3 shadow-sm lg:mx-0 dark:border-border-dark dark:bg-card-dark">
              <NavButton
                onClick={goToStart}
                disabled={atStart}
                title="Go to start (Home)"
              >
                ⏮
              </NavButton>
              <NavButton
                onClick={goToPrev}
                disabled={atStart}
                title="Previous move (←)"
              >
                ◀
              </NavButton>

              {/* Move counter */}
              <div className="flex-1 text-center text-sm text-muted-fg-light select-none dark:text-muted-fg-dark">
                <span className="font-semibold text-fg-light dark:text-fg-dark">
                  {currentMoveIndex}
                </span>
                <span className="mx-1">/</span>
                <span>{totalMoves}</span>
              </div>

              <NavButton
                onClick={goToNext}
                disabled={atEnd}
                title="Next move (→)"
              >
                ▶
              </NavButton>
              <NavButton
                onClick={goToEnd}
                disabled={atEnd}
                title="Go to end (End)"
              >
                ⏭
              </NavButton>
            </div>

            {/* Keyboard hint */}
            <p className="mx-auto w-full max-w-[520px] text-center text-xs text-muted-fg-light lg:mx-0 dark:text-muted-fg-dark">
              Use{" "}
              <kbd className="rounded bg-secondary-light px-1.5 py-0.5 font-mono text-[10px] dark:bg-secondary-dark">
                ←
              </kbd>{" "}
              <kbd className="rounded bg-secondary-light px-1.5 py-0.5 font-mono text-[10px] dark:bg-secondary-dark">
                →
              </kbd>{" "}
              arrow keys ·{" "}
              <kbd className="rounded bg-secondary-light px-1.5 py-0.5 font-mono text-[10px] dark:bg-secondary-dark">
                Home
              </kbd>{" "}
              <kbd className="rounded bg-secondary-light px-1.5 py-0.5 font-mono text-[10px] dark:bg-secondary-dark">
                End
              </kbd>{" "}
              to navigate
            </p>
          </div>

          {/* ── RIGHT: Game Info Panel ───────────────────────────── */}
          <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
            {/* Header: Players + Result */}
            <div className="rounded-2xl border border-border-light bg-card-light p-5 shadow-sm dark:border-border-dark dark:bg-card-dark">
              <div className="flex items-center justify-between gap-3">
                {/* White */}
                <div className="flex flex-col items-center gap-1">
                  <span className="mb-1 text-[10px] font-semibold tracking-widest text-muted-fg-light uppercase dark:text-muted-fg-dark">
                    White
                  </span>
                  <PlayerAvatar player={game.whitePlayer} />
                </div>

                {/* VS + Result */}
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-bold ${resultInfo.colorClass}`}
                  >
                    {resultInfo.text}
                  </span>
                  <span className="text-xl font-bold text-muted-fg-light dark:text-muted-fg-dark">
                    vs
                  </span>
                  <span className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
                    {formatDate(game.createdAt)}
                  </span>
                </div>

                {/* Black */}
                <div className="flex flex-col items-center gap-1">
                  <span className="mb-1 text-[10px] font-semibold tracking-widest text-muted-fg-light uppercase dark:text-muted-fg-dark">
                    Black
                  </span>
                  <PlayerAvatar player={game.blackPlayer} />
                </div>
              </div>
            </div>

            {/* Game Details */}
            <div className="rounded-2xl border border-border-light bg-card-light p-5 shadow-sm dark:border-border-dark dark:bg-card-dark">
              <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-fg-light uppercase dark:text-muted-fg-dark">
                Game Details
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                {game.opening && (
                  <>
                    <dt className="col-span-2 text-xs text-muted-fg-light sm:col-span-1 dark:text-muted-fg-dark">
                      Opening
                    </dt>
                    <dd
                      className="col-span-2 truncate text-sm font-medium text-fg-light sm:col-span-1 dark:text-fg-dark"
                      title={game.opening}
                    >
                      {game.opening}
                    </dd>
                  </>
                )}
                <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
                  Time Control
                </dt>
                <dd className="text-sm font-medium text-fg-light dark:text-fg-dark">
                  {game.timeControl === "unlimited"
                    ? "∞ Unlimited"
                    : game.timeControl}
                </dd>
                <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
                  Total Moves
                </dt>
                <dd className="text-sm font-medium text-fg-light dark:text-fg-dark">
                  {totalMoves}
                </dd>
                <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
                  Duration
                </dt>
                <dd className="text-sm font-medium text-fg-light dark:text-fg-dark">
                  {formatDuration(game.duration)}
                </dd>
                <dt className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
                  Result
                </dt>
                <dd className="text-sm font-medium text-fg-light capitalize dark:text-fg-dark">
                  {formatResultMethod(game.resultMethod)}
                </dd>
              </dl>
            </div>

            {/* Move List */}
            <div className="flex min-h-0 flex-col rounded-2xl border border-border-light bg-card-light shadow-sm dark:border-border-dark dark:bg-card-dark">
              <div className="border-b border-border-light px-5 py-3 dark:border-border-dark">
                <h3 className="text-xs font-semibold tracking-widest text-muted-fg-light uppercase dark:text-muted-fg-dark">
                  Move List
                </h3>
              </div>

              {moveRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-fg-light italic dark:text-muted-fg-dark">
                  No moves recorded
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto lg:max-h-80">
                  {/* Column headers */}
                  <div className="sticky top-0 grid grid-cols-[2.5rem_1fr_1fr] gap-x-1 border-b border-border-light bg-secondary-light/50 px-3 py-2 dark:border-border-dark dark:bg-secondary-dark/30">
                    <span className="text-xs font-semibold text-muted-fg-light dark:text-muted-fg-dark">
                      #
                    </span>
                    <span className="text-xs font-semibold text-muted-fg-light dark:text-muted-fg-dark">
                      White
                    </span>
                    <span className="text-xs font-semibold text-muted-fg-light dark:text-muted-fg-dark">
                      Black
                    </span>
                  </div>

                  {moveRows.map((row) => {
                    const whiteActive = currentMoveIndex === row.whiteIdx;
                    const blackActive = currentMoveIndex === row.blackIdx;
                    return (
                      <div
                        key={row.number}
                        className="grid grid-cols-[2.5rem_1fr_1fr] gap-x-1 px-3"
                      >
                        {/* Move number */}
                        <span className="self-center py-1.5 font-mono text-xs text-muted-fg-light dark:text-muted-fg-dark">
                          {row.number}.
                        </span>

                        {/* White move */}
                        <button
                          onClick={() => goToMove(row.whiteIdx)}
                          className={`rounded-lg px-2 py-1.5 text-left font-mono text-sm transition-colors duration-100 ${
                            whiteActive
                              ? "bg-primary-light font-semibold text-white dark:bg-primary-dark"
                              : "text-fg-light hover:bg-secondary-light dark:text-fg-dark dark:hover:bg-secondary-dark"
                          }`}
                        >
                          {row.white}
                        </button>

                        {/* Black move */}
                        {row.black ? (
                          <button
                            onClick={() => goToMove(row.blackIdx)}
                            className={`rounded-lg px-2 py-1.5 text-left font-mono text-sm transition-colors duration-100 ${
                              blackActive
                                ? "bg-primary-light font-semibold text-white dark:bg-primary-dark"
                                : "text-fg-light hover:bg-secondary-light dark:text-fg-dark dark:hover:bg-secondary-dark"
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
