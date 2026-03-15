"use client";

import React from "react";
import { useModal } from "@/hooks/useModal";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  containerClassName,
}: ModalProps) {
  const { handleBackdropClick } = useModal({ onClose, isOpen });

  if (!isOpen) return null;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200",
        containerClassName
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={clsx(
          "relative w-full max-w-md transform rounded-2xl border border-border-light bg-card-light p-8 text-card-fg-light shadow-2xl transition-all dark:border-border-dark dark:bg-card-dark dark:text-card-fg-dark animate-in zoom-in-95 duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
