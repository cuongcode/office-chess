import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackLink() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/history")}
      className="flex items-center gap-1.5 self-start text-sm text-muted-fg-light transition-colors hover:text-primary-light dark:text-muted-fg-dark dark:hover:text-primary-dark"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to History
    </button>
  );
}
