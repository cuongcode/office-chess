"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { PlayerSearchBar } from "./PlayerSearchBar";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { HeaderInfo } from "./HeaderInfo";
import toast from "react-hot-toast";

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
        playerColor
    } = useGameStore();

    const getStatusText = () => {
        if (gameStatus === 'checkmate') return 'Checkmate';
        if (gameStatus === 'draw') return 'Draw';
        if (gameStatus === 'stalemate') return 'Stalemate';
        if (gameStatus === 'check') return 'Check!';
        if (isOnline) {
            if (playerColor === 'spectator') return `${turn === 'w' ? "White" : "Black"}'s turn`;
            const isMyTurn = (turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black');
            return isMyTurn ? "Your turn" : "Opponent's turn";
        }
        return `${turn === 'w' ? "White" : "Black"}'s turn`;
    };

    const copyRoomId = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            toast.success('Room code copied');
        }
    };

    return (
        <header className="fixed top-0 w-full z-50 bg-card-light dark:bg-card-dark text-card-fg-light dark:text-card-fg-dark border-b border-border-light dark:border-border-dark">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <Link href="/" className="text-xl font-bold text-fg-light dark:text-fg-dark">
                        Office Chess
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block flex-1 max-w-md mx-4">
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
                            ) : (
                                <PlayerSearchBar onPlayerSelect={(id) => router.push(`/profile/${id}`)} />
                            )}
                        </div>
                        <ThemeToggle />
                        {status === "loading" ? (
                            <div className="text-sm text-muted-fg-light dark:text-muted-fg-dark">Loading...</div>
                        ) : session?.user ? (
                            <UserMenu user={session.user} />
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    href="/auth/login"
                                    className="text-muted-fg-light dark:text-muted-fg-dark hover:text-fg-light dark:hover:text-fg-dark px-3 py-2 rounded-md text-sm font-medium hover:bg-accent-light dark:hover:bg-accent-dark"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-primary-light dark:bg-primary-dark text-white shadow-sm hover:opacity-90 hover:-translate-y-px active:translate-y-0 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium tracking-[0.3px] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring-light dark:focus:ring-ring-dark"
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
