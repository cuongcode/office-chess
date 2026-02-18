"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                        ) : session ? (
                            <div className="relative ml-3">
                                <div>
                                    <button
                                        type="button"
                                        className="flex max-w-xs items-center rounded-full bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        id="user-menu-button"
                                        aria-expanded="false"
                                        aria-haspopup="true"
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        {(session.user as any)?.avatar ? (
                                            <img
                                                src={(session.user as any).avatar}
                                                alt={session.user?.name || 'User'}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                                                {session.user?.name ? session.user.name.charAt(0).toUpperCase() : session.user?.email?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </button>
                                </div>
                                {/* Dropdown menu */}
                                {isMenuOpen && (
                                    <div
                                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-card py-1 shadow-lg ring-1 ring-border focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                        tabIndex={-1}
                                    >
                                        <div className="px-4 py-2 text-sm text-card-foreground border-b border-border">
                                            <p className="font-medium truncate">{session.user?.name || "User"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                                        </div>
                                        {/* Profile link */}
                                        <Link
                                            href={`/profile/${(session.user as any)?.id}`}
                                            className="block px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
                                            role="menuitem"
                                            tabIndex={-1}
                                            id="user-menu-item-0"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Your Profile
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="block w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
                                            role="menuitem"
                                            tabIndex={-1}
                                            id="user-menu-item-2"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
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
