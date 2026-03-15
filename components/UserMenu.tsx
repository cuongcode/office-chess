"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "./UserAvatar";

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
          className="focus:ring-ring flex max-w-xs items-center rounded-full bg-card-light text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none dark:bg-card-dark"
          id="user-menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Open user menu</span>
          <UserAvatar 
            name={user.name} 
            avatarUrl={user.avatar} 
            size="h-8 w-8"
          />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-card-light py-1 shadow-lg ring-1 ring-border-light focus:outline-none dark:bg-card-dark dark:ring-border-dark"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          tabIndex={-1}
        >
          <div className="border-b border-border-light px-4 py-2 text-sm text-card-fg-light dark:border-border-dark dark:text-card-fg-dark">
            <p className="truncate font-medium">{user.name || "User"}</p>
            <p className="truncate text-xs text-muted-fg-light dark:text-muted-fg-dark">
              {user.email}
            </p>
          </div>

          <Link
            href={`/profile/${user.id}`}
            className="block px-4 py-2 text-sm text-card-fg-light hover:bg-muted-light hover:text-fg-light dark:text-card-fg-dark dark:hover:bg-muted-dark dark:hover:text-fg-dark"
            role="menuitem"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
          >
            Your Profile
          </Link>
          <Link
            href="/history"
            className="block px-4 py-2 text-sm text-card-fg-light hover:bg-muted-light hover:text-fg-light dark:text-card-fg-dark dark:hover:bg-muted-dark dark:hover:text-fg-dark"
            role="menuitem"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
          >
            Game History
          </Link>
          <button
            onClick={() => signOut()}
            className="block w-full px-4 py-2 text-left text-sm text-card-fg-light hover:bg-muted-light hover:text-fg-light dark:text-card-fg-dark dark:hover:bg-muted-dark dark:hover:text-fg-dark"
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
