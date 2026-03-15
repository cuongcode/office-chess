import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui";

export function BackLink() {
  const router = useRouter();
  return (
    <Button
      variant="unstyled"
      size="none"
      onClick={() => router.push("/history")}
      className="flex items-center gap-1.5 self-start text-sm text-muted-fg-light transition-colors hover:text-primary-light dark:text-muted-fg-dark dark:hover:text-primary-dark cursor-pointer"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to History
    </Button>
  );
}
