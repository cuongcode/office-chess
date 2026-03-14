export function NavButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-light bg-secondary-light text-lg font-bold text-fg-light select-none hover:bg-primary-light hover:text-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-border-dark dark:bg-secondary-dark dark:text-fg-dark dark:hover:bg-primary-dark dark:hover:text-white"
    >
      {children}
    </button>
  );
}
