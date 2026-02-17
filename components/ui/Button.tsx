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
    return (
        <button
            className={clsx(
                variant === "primary" ? "btn-primary" : "btn-secondary",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
