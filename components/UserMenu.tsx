"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface User {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    avatar?: string | null;
    id?: string;
}

interface UserMenuProps {
    user: User;
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleEscKey(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscKey);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [isOpen]);

    return (
        <div className="relative ml-3" ref={menuRef}>
            <div>
                <button
                    type="button"
                    className="flex max-w-xs items-center rounded-full bg-card-light dark:bg-card-dark text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    id="user-menu-button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="sr-only">Open user menu</span>
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name || 'User'}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-muted-light dark:bg-muted-dark flex items-center justify-center text-muted-fg-light dark:text-muted-fg-dark font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </button>
            </div>

            {isOpen && (
                <div
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-card-light dark:bg-card-dark py-1 shadow-lg ring-1 ring-border-light dark:ring-border-dark focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                >
                    <div className="px-4 py-2 text-sm text-card-fg-light dark:text-card-fg-dark border-b border-border-light dark:border-border-dark">
                        <p className="font-medium truncate">{user.name || "User"}</p>
                        <p className="text-xs text-muted-fg-light dark:text-muted-fg-dark truncate">{user.email}</p>
                    </div>

                    <Link
                        href={`/profile/${user.id}`}
                        className="block px-4 py-2 text-sm text-card-fg-light dark:text-card-fg-dark hover:bg-muted-light dark:hover:bg-muted-dark hover:text-fg-light dark:hover:text-fg-dark"
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => setIsOpen(false)}
                    >
                        Your Profile
                    </Link>
                    <Link
                        href="/history"
                        className="block px-4 py-2 text-sm text-card-fg-light dark:text-card-fg-dark hover:bg-muted-light dark:hover:bg-muted-dark hover:text-fg-light dark:hover:text-fg-dark"
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => setIsOpen(false)}
                    >
                        Game History
                    </Link>
                    <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-card-fg-light dark:text-card-fg-dark hover:bg-muted-light dark:hover:bg-muted-dark hover:text-fg-light dark:hover:text-fg-dark"
                        role="menuitem"
                        tabIndex={-1}
                    >
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
