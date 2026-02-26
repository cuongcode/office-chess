"use client";

import { ChessBoard } from "@/components/ChessBoard";
import { GameModeSelector } from "@/components/GameModeSelector";
import { CreateGameModal } from "@/components/CreateGameModal";
import { JoinGameModal } from "@/components/JoinGameModal";
import { ActiveGamesList } from "@/components/ActiveGamesList";
import { LeaderboardWidget } from "@/components/LeaderboardWidget";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Toaster } from "react-hot-toast";
import { PlayerSearchBar } from "@/components/PlayerSearchBar";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { connect, isOnline, resetGame, leaveGame } = useGameStore();

  const [view, setView] = useState<'menu' | 'game'>('menu');
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
    const savedRoomId = localStorage.getItem('chess_room_id');
    if (savedRoomId) {
      setView('game');
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
      setView('game');
      setShowCreateModal(false);
      setShowJoinModal(false);
      setShowActiveGames(false);
    }
  }, [isOnline]);

  if (status === "loading" || isRestoring) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  if (!session) return null;

  const handleLocalGame = () => {
    resetGame();
    // Ensure we are offline
    leaveGame();
    setView('game');
  };

  const handleCreateOnline = () => {
    setShowCreateModal(true);
  };

  return (
    <main className="min-h-screen bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark flex flex-col pt-18">
      <Toaster position="top-right" />

      {view === 'menu' && (
        <div className="flex-1 flex flex-col items-center p-6">
          <div className="w-full max-w-4xl flex flex-col items-center gap-6">

            <div className="w-full md:hidden">
              <PlayerSearchBar onPlayerSelect={(id) => router.push(`/profile/${id}`)} />
            </div>

            <GameModeSelector
              onSelectLocal={handleLocalGame}
              onSelectCreateOnline={handleCreateOnline}
              onSelectJoinOnline={() => setShowJoinModal(true)}
              onSelectActiveGames={() => setShowActiveGames(true)}
            />

            <div className="w-full md:w-1/2">
              <LeaderboardWidget />
            </div>
          </div>
        </div>
      )}

      {view === 'game' && (
        <ChessBoard onLeave={() => setView('menu')} />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateGameModal
          userId={(session.user as any)?.id || session.user?.email || 'guest'}
          userName={session.user?.name || 'Guest'}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showJoinModal && (
        <JoinGameModal
          userId={(session.user as any)?.id || session.user?.email || 'guest'}
          userName={session.user?.name || 'Guest'}
          onClose={() => setShowJoinModal(false)}
        />
      )}

      {showActiveGames && (
        <ActiveGamesList
          userId={(session.user as any)?.id || session.user?.email || 'guest'}
          userName={session.user?.name || 'Guest'}
          onClose={() => setShowActiveGames(false)}
        />
      )}
    </main>
  );
}
