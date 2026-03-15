import { useEffect, useCallback } from "react";

interface UseModalProps {
  onClose: () => void;
  isOpen?: boolean;
}

export function useModal({ onClose, isOpen = true }: UseModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if the backdrop itself was clicked
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return { handleBackdropClick };
}
