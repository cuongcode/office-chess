"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="h-9 w-9 rounded-md p-2 opacity-0 transition-colors hover:bg-accent-light hover:text-accent-fg-light dark:hover:bg-accent-dark dark:hover:text-accent-fg-dark">
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-md p-2 transition-colors hover:bg-accent-light hover:text-accent-fg-light focus:ring-2 focus:ring-ring-light focus:outline-none dark:hover:bg-accent-dark dark:hover:text-accent-fg-dark dark:focus:ring-ring-dark"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-yellow-300" />
      ) : (
        <Sun className="h-5 w-5 text-orange-500" />
      )}
    </button>
  );
}
