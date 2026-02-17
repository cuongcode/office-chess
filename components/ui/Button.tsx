import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    className?: string; // Allow custom classes
}

const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    className,
    children,
    ...props
}) => {
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
};

export default Button;
