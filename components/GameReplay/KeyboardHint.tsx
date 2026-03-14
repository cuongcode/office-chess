export function KeyboardHint() {
  return (
    <p className="mx-auto w-full max-w-[520px] text-center text-xs text-muted-fg-light lg:mx-0 dark:text-muted-fg-dark">
      Use{" "}
      <kbd className="rounded bg-secondary-light px-1.5 py-0.5 font-mono text-[10px] dark:bg-secondary-dark">
        ←
      </kbd>{" "}
      <kbd className="rounded bg-secondary-light px-1.5 py-0.5 font-mono text-[10px] dark:bg-secondary-dark">
        →
      </kbd>{" "}
      arrow keys ·{" "}
      <kbd className="rounded bg-secondary-light px-1.5 py-0.5 font-mono text-[10px] dark:bg-secondary-dark">
        Home
      </kbd>{" "}
      <kbd className="rounded bg-secondary-light px-1.5 py-0.5 font-mono text-[10px] dark:bg-secondary-dark">
        End
      </kbd>{" "}
      to navigate
    </p>
  );
}
