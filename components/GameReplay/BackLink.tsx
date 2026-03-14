import { useRouter } from "next/navigation";

export function BackLink() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/history")}
      className="flex items-center gap-1.5 self-start text-sm text-muted-fg-light transition-colors hover:text-primary-light dark:text-muted-fg-dark dark:hover:text-primary-dark"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Back to History
    </button>
  );
}
