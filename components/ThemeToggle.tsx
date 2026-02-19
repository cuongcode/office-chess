"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="p-2 rounded-md hover:bg-accent-light dark:hover:bg-accent-dark hover:text-accent-fg-light dark:hover:text-accent-fg-dark transition-colors w-9 h-9 opacity-0">
                <Sun className="h-5 w-5" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent-light dark:hover:bg-accent-dark hover:text-accent-fg-light dark:hover:text-accent-fg-dark transition-colors w-9 h-9 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring-light dark:focus:ring-ring-dark"
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
