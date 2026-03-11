"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import {
  ActiveGamesList,
  ChessBoard,
  CreateGameModal,
  GameModeSelector,
  JoinGameModal,
  LeaderboardWidget,
  PlayerSearchBar,
} from "@/components";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { connect, isOnline, resetGame, leaveGame } = useGameStore();

  const [view, setView] = useState<"menu" | "game">("menu");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showActiveGames, setShowActiveGames] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Check for existing game session on mount
  useEffect(() => {
    const savedRoomId = localStorage.getItem("chess_room_id");
    if (savedRoomId) {
      setView("game");
    }
    setIsRestoring(false);
  }, []);

  // Connect to socket on mount if authenticated
  useEffect(() => {
    if (session?.user) {
      connect();
    }
  }, [session, connect]);

  // Auto-switch to game view if online game starts
  useEffect(() => {
    if (isOnline) {
      setView("game");
      setShowCreateModal(false);
      setShowJoinModal(false);
      setShowActiveGames(false);
    }
  }, [isOnline]);

  if (status === "loading" || isRestoring) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  if (!session) return null;

  const handleLocalGame = () => {
    resetGame();
    // Ensure we are offline
    leaveGame();
    setView("game");
  };

  const handleCreateOnline = () => {
    setShowCreateModal(true);
  };

  return (
    <main className="flex min-h-screen flex-col bg-bg-light pt-36 text-fg-light dark:bg-bg-dark dark:text-fg-dark">
      {view === "menu" && (
        <div className="flex flex-1 flex-col items-center p-6">
          <div className="flex w-full max-w-4xl flex-col items-center gap-6">
            <div className="w-full md:hidden">
              <PlayerSearchBar
                onPlayerSelect={(id) => router.push(`/profile/${id}`)}
              />
            </div>

            <GameModeSelector
              onSelectLocal={handleLocalGame}
              onSelectCreateOnline={handleCreateOnline}
              onSelectJoinOnline={() => setShowJoinModal(true)}
              onSelectActiveGames={() => setShowActiveGames(true)}
              onSelectHistory={() => router.push("/history")}
            />

            <div className="w-full md:w-1/2">
              <LeaderboardWidget />
            </div>
          </div>
        </div>
      )}

      {view === "game" && <ChessBoard onLeave={() => setView("menu")} />}

      {/* Modals */}
      {showCreateModal && (
        <CreateGameModal
          userId={(session.user as any)?.id || session.user?.email || "guest"}
          userName={session.user?.name || "Guest"}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showJoinModal && (
        <JoinGameModal
          userId={(session.user as any)?.id || session.user?.email || "guest"}
          userName={session.user?.name || "Guest"}
          onClose={() => setShowJoinModal(false)}
        />
      )}

      {showActiveGames && (
        <ActiveGamesList
          userId={(session.user as any)?.id || session.user?.email || "guest"}
          userName={session.user?.name || "Guest"}
          onClose={() => setShowActiveGames(false)}
        />
      )}
    </main>
  );
}
