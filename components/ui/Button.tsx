import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    className?: string; // Allow custom classes
}

export function Button({
    variant = "primary",
    className,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium tracking-[0.3px] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-primary-light dark:bg-primary-dark text-primary-fg-light dark:text-primary-fg-dark shadow-sm hover:opacity-90 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(52,152,219,0.3)] active:translate-y-0",
        secondary: "bg-secondary-light dark:bg-secondary-dark text-secondary-fg-light dark:text-secondary-fg-dark border border-border-light dark:border-border-dark hover:bg-secondary-light/80 dark:hover:bg-secondary-dark/80"
    };

    return (
        <button
            className={clsx(
                baseStyles,
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
