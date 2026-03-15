"use client";

import { useTheme } from "@/components/ThemeProvider";
import { PlayerInfo } from "@/components/PlayerInfo";
import { Chess } from "chess.js";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  BackLink,
  NavigationControls,
  KeyboardHint,
  GameHeader,
  GameDetails,
  MoveList,
  getResultLabel,
  type GameData,
} from "@/components/GameReplay";

const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-full animate-pulse rounded-xl bg-secondary-light dark:bg-secondary-dark" />
    ),
  },
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GameReplayPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const gameId = params?.gameId as string;

  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white",
  );
  const STARTING_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [currentFEN, setCurrentFEN] = useState(STARTING_FEN);
  const [capturedPieces, setCapturedPieces] = useState<{
    white: string[];
    black: string[];
  }>({ white: [], black: [] });

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
        // Set initial orientation based on player color if they participated
        const userId = (session?.user as any)?.id;
        if (userId === data.whitePlayerId) {
          setBoardOrientation("white");
        } else if (userId === data.blackPlayerId) {
          setBoardOrientation("black");
        }
        // Start at position 0 (before any moves)
        setCurrentFEN(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );
        setCurrentMoveIndex(0);
        setCapturedPieces({ white: [], black: [] });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [gameId, (session?.user as any)?.id]);

  // Navigate to a specific move index (0 = start, n = after n moves)
  const goToMove = useCallback(
    (index: number) => {
      if (!game) return;
      const moves = game.moveHistory as string[];
      const clamped = Math.max(0, Math.min(index, moves.length));
      const chess = new Chess();
      const newCapturedPieces = {
        white: [] as string[],
        black: [] as string[],
      };
      for (let i = 0; i < clamped; i++) {
        const move = chess.move(moves[i]);
        if (move && move.captured) {
          const capturingColor = move.color === "w" ? "white" : "black";
          newCapturedPieces[capturingColor].push(move.captured);
        }
      }
      setCurrentFEN(chess.fen());
      setCurrentMoveIndex(clamped);
      setCapturedPieces(newCapturedPieces);
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
    () => game && goToMove(game.moveHistory.length),
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

  const flipBoard = useCallback(() => {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
  }, []);

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
  const moves = game.moveHistory as string[];
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
        <BackLink />

        {/* Main layout: board + info side by side on Desktop, stacked on Mobile */}
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          {/* ── LEFT: Board + Controls ───────────────────────────── */}
          <div className="mx-auto flex w-full max-w-[520px] flex-col gap-4 lg:w-auto">
            {/* Top Player */}
            <PlayerInfo
              name={
                boardOrientation === "white"
                  ? game.blackPlayer.username || game.blackPlayer.name || "Unknown"
                  : game.whitePlayer.username || game.whitePlayer.name || "Unknown"
              }
              subLabel={boardOrientation === "white" ? "Black" : "White"}
              avatarUrl={
                boardOrientation === "white"
                  ? game.blackPlayer.avatar
                  : game.whitePlayer.avatar
              }
              isMe={
                boardOrientation === "white"
                  ? (session?.user as any)?.id === game.blackPlayerId
                  : (session?.user as any)?.id === game.whitePlayerId
              }
              capturedPieces={
                boardOrientation === "white"
                  ? capturedPieces.black
                  : capturedPieces.white
              }
              playerColor={boardOrientation === "white" ? "black" : "white"}
              opponentCapturedPieces={
                boardOrientation === "white"
                  ? capturedPieces.white
                  : capturedPieces.black
              }
              showClock={false}
              clockOrientation="top"
            />

            {/* Board */}
            <div className="mx-auto aspect-square w-full overflow-hidden rounded-lg border border-border-light bg-card-light lg:mx-0 dark:border-border-dark dark:bg-card-dark">
              <Chessboard
                options={{
                  id: "ReplayBoard",
                  position: currentFEN,
                  boardOrientation: boardOrientation,
                  allowDragging: false,
                  animationDurationInMs: 150,
                  darkSquareStyle: {
                    backgroundColor:
                      theme === "dark"
                        ? "var(--color-board-dark-dark)"
                        : "var(--color-board-dark-light)",
                  },
                  lightSquareStyle: {
                    backgroundColor:
                      theme === "dark"
                        ? "var(--color-board-light-dark)"
                        : "var(--color-board-light-light)",
                  },
                }}
              />
            </div>

            {/* Bottom Player */}
            <PlayerInfo
              name={
                boardOrientation === "white"
                  ? game.whitePlayer.username || game.whitePlayer.name || "Unknown"
                  : game.blackPlayer.username || game.blackPlayer.name || "Unknown"
              }
              subLabel={boardOrientation === "white" ? "White" : "Black"}
              avatarUrl={
                boardOrientation === "white"
                  ? game.whitePlayer.avatar
                  : game.blackPlayer.avatar
              }
              isMe={
                boardOrientation === "white"
                  ? (session?.user as any)?.id === game.whitePlayerId
                  : (session?.user as any)?.id === game.blackPlayerId
              }
              capturedPieces={
                boardOrientation === "white"
                  ? capturedPieces.white
                  : capturedPieces.black
              }
              playerColor={boardOrientation === "white" ? "white" : "black"}
              opponentCapturedPieces={
                boardOrientation === "white"
                  ? capturedPieces.black
                  : capturedPieces.white
              }
              showClock={false}
              clockOrientation="bottom"
            />

            <NavigationControls
              currentMoveIndex={currentMoveIndex}
              totalMoves={totalMoves}
              goToStart={goToStart}
              goToPrev={goToPrev}
              goToNext={goToNext}
              goToEnd={goToEnd}
              onFlipBoard={flipBoard}
            />

            {/* <KeyboardHint /> */}
          </div>

          {/* ── RIGHT: Game Info Panel ───────────────────────────── */}
          <div className="mx-auto flex w-full max-w-[520px] min-w-0 flex-1 flex-col gap-4">
            {/* <GameHeader game={game} resultInfo={resultInfo} /> */}
            {/* <GameDetails game={game} totalMoves={totalMoves} /> */}
            <MoveList
              moveRows={moveRows}
              currentMoveIndex={currentMoveIndex}
              goToMove={goToMove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
