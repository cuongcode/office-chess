import clsx from "clsx";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "unstyled";
  size?: "sm" | "md" | "lg" | "icon" | "none";
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary:
      "rounded-lg bg-primary-light dark:bg-primary-dark text-primary-fg-light dark:text-primary-fg-dark shadow-sm hover:opacity-90 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(52,152,219,0.3)] active:translate-y-0",
    secondary:
      "rounded-lg bg-card-light dark:bg-card-dark text-fg-light dark:text-fg-dark border border-border-light dark:border-border-dark hover:bg-accent-light dark:hover:bg-accent-dark",
    outline:
      "rounded-lg border-2 border-primary-light dark:border-primary-dark bg-transparent text-primary-light dark:text-primary-dark hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark",
    ghost:
      "rounded-md bg-transparent hover:bg-accent-light dark:hover:bg-accent-dark text-fg-light dark:text-fg-dark",
    unstyled: "",
  };

  const sizes = {
    none: "",
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm font-medium tracking-[0.3px]",
    lg: "px-8 py-4 text-base font-semibold",
    icon: "p-2",
  };

  return (
    <button
      className={clsx(
        variant !== "unstyled" && baseStyles,
        variant !== "unstyled" && sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
