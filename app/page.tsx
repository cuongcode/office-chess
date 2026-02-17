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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster position="top-right" />

      {view === 'menu' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-4xl space-y-8 flex flex-col items-center">

            <div className="text-center space-y-4 mb-8">
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                Office Chess
              </h1>
              <p className="text-xl text-muted-foreground font-light max-w-lg mx-auto">
                Challenge your colleagues, climb the ranks.
              </p>
              {session?.user && (
                <p className="text-lg font-medium text-foreground">
                  Welcome back, <span className="text-blue-500">{session.user.name || 'Player'}</span>!
                </p>
              )}
            </div>

            <div className="w-full max-w-xl mb-8">
              <PlayerSearchBar onPlayerSelect={(id) => router.push(`/profile/${id}`)} />
            </div>

            <GameModeSelector
              onSelectLocal={handleLocalGame}
              onSelectCreateOnline={handleCreateOnline}
              onSelectJoinOnline={() => setShowJoinModal(true)}
              onSelectActiveGames={() => setShowActiveGames(true)}
            />

            <div className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <LeaderboardWidget />
              {/* Placeholder for future widgets */}
              <div className="bg-card rounded-lg shadow p-6 border border-border flex items-center justify-center text-muted-foreground h-full min-h-[200px]">
                <p>Recent Activity (Coming Soon)</p>
              </div>
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
