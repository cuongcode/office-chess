"use client";

import ChessBoard from "@/components/ChessBoard";
import GameModeSelector from "@/components/GameModeSelector";
import CreateGameModal from "@/components/CreateGameModal";
import JoinGameModal from "@/components/JoinGameModal";
import ActiveGamesList from "@/components/ActiveGamesList";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Toaster } from "react-hot-toast";

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 gap-8 font-[family-name:var(--font-geist-sans)] relative">
      <Toaster position="top-right" />

      {view === 'menu' && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
              Office Chess
            </h1>
            <p className="text-gray-400 text-lg">
              Welcome, {session.user?.name || "Player"}
            </p>
          </div>

          <GameModeSelector
            onSelectLocal={handleLocalGame}
            onSelectCreateOnline={() => setShowCreateModal(true)}
            onSelectJoinOnline={() => setShowJoinModal(true)}
            onSelectActiveGames={() => setShowActiveGames(true)}
          />
        </>
      )}

      {view === 'game' && (
        <ChessBoard onLeave={() => setView('menu')} />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateGameModal
          userId={session.user?.email || 'guest'} // Use email as ID for now or a proper ID if available
          userName={session.user?.name || 'Guest'}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showJoinModal && (
        <JoinGameModal
          userId={session.user?.email || 'guest'}
          userName={session.user?.name || 'Guest'}
          onClose={() => setShowJoinModal(false)}
        />
      )}

      {showActiveGames && (
        <ActiveGamesList
          userId={session.user?.email || 'guest'}
          userName={session.user?.name || 'Guest'}
          onClose={() => setShowActiveGames(false)}
        />
      )}
    </div>
  );
}
