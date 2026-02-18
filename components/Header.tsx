"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Header() {
    const { data: session, status } = useSession();

    return (
        <header className="fixed top-0 w-full z-50 bg-card text-card-foreground shadow border-b border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex px-2 lg:px-0">
                        <div className="flex flex-shrink-0 items-center">
                            <Link href="/" className="text-xl font-bold text-foreground">
                                Office Chess
                            </Link>
                        </div>
                        {/* <div className="hidden lg:ml-8 lg:flex lg:space-x-4">
                            <Link
                                href="/leaderboard"
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                            >
                                🏆 Leaderboard
                            </Link>
                        </div> */}
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {status === "loading" ? (
                            <div className="text-sm text-muted-foreground">Loading...</div>
                        ) : session?.user ? (
                            <UserMenu user={session.user} />
                        ) : (
                            <div className="space-x-4">
                                <Link
                                    href="/auth/login"
                                    className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-[var(--interactive-primary)] text-white shadow-sm hover:bg-[var(--interactive-primary-hover)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(52,152,219,0.3)] active:translate-y-0 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium tracking-[0.3px] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
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
