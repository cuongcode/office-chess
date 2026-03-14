export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getResultLabel(result: string): { text: string; colorClass: string } {
  switch (result) {
    case "white_win":
    case "timeout_black":
      return {
        text: result === "white_win" ? "White Wins" : "White Wins on Time",
        colorClass:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300 dark:border-amber-700",
      };
    case "black_win":
    case "timeout_white":
      return {
        text: result === "black_win" ? "Black Wins" : "Black Wins on Time",
        colorClass:
          "bg-slate-700 text-slate-100 dark:bg-slate-800 dark:text-slate-200 border border-slate-500",
      };
    case "draw":
      return {
        text: "Draw",
        colorClass:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-700",
      };
    default:
      return {
        text: result,
        colorClass:
          "bg-secondary-light dark:bg-secondary-dark text-fg-light dark:text-fg-dark",
      };
  }
}

export function formatResultMethod(method: string): string {
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
