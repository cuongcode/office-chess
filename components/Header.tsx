"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { useGameStore } from "@/store/gameStore";

import { HeaderInfo } from "./HeaderInfo";
import { PlayerSearchBar } from "./PlayerSearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    roomId,
    spectatorCount,
    status: gameStatus,
    isOnline,
    isConnected,
    turn,
    playerColor,
  } = useGameStore();

  const getStatusText = () => {
    if (gameStatus === "checkmate") return "Checkmate";
    if (gameStatus === "draw") return "Draw";
    if (gameStatus === "stalemate") return "Stalemate";
    if (gameStatus === "check") return "Check!";
    if (isOnline) {
      if (playerColor === "spectator")
        return `${turn === "w" ? "White" : "Black"}'s turn`;
      const isMyTurn =
        (turn === "w" && playerColor === "white") ||
        (turn === "b" && playerColor === "black");
      return isMyTurn ? "Your turn" : "Opponent's turn";
    }
    return `${turn === "w" ? "White" : "Black"}'s turn`;
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success("Room code copied");
    }
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border-light bg-card-light text-card-fg-light dark:border-border-dark dark:bg-card-dark dark:text-card-fg-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-fg-light dark:text-fg-dark"
          >
            Office Chess
          </Link>

          <div className="flex items-center gap-4">
            <div className="mx-4 hidden max-w-md flex-1 md:block">
              {roomId ? (
                <HeaderInfo
                  roomId={roomId}
                  spectatorCount={spectatorCount}
                  status={gameStatus}
                  statusText={getStatusText()}
                  isOnline={isOnline}
                  isConnected={isConnected}
                  onCopyRoomId={copyRoomId}
                />
              ) : session?.user ? (
                <PlayerSearchBar
                  onPlayerSelect={(id) => router.push(`/profile/${id}`)}
                />
              ) : null}
            </div>
            <ThemeToggle />
            {status === "loading" ? (
              <div className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
                Loading...
              </div>
            ) : session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-fg-light hover:bg-accent-light hover:text-fg-light dark:text-muted-fg-dark dark:hover:bg-accent-dark dark:hover:text-fg-dark"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-lg bg-primary-light px-6 py-3 text-sm font-medium tracking-[0.3px] text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:opacity-90 focus:ring-2 focus:ring-ring-light focus:ring-offset-2 focus:outline-none active:translate-y-0 dark:bg-primary-dark dark:focus:ring-ring-dark"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
