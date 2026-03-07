"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getConfirmButtonStyles = () => {
    switch (confirmVariant) {
      case "danger":
        return "bg-destructive hover:bg-destructive/80 text-white";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      case "primary":
        return "bg-primary-light dark:bg-primary-dark hover:opacity-90 text-white";
      default:
        return "bg-destructive hover:bg-destructive/80 text-white";
    }
  };

  const getIconColor = () => {
    switch (confirmVariant) {
      case "danger":
        return "text-destructive";
      case "warning":
        return "text-yellow-400";
      case "primary":
        return "text-primary-light dark:text-primary-dark";
      default:
        return "text-destructive";
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md scale-100 transform rounded-2xl border border-border-light bg-card-light p-6 text-card-fg-light shadow-2xl dark:border-border-dark dark:bg-card-dark dark:text-card-fg-dark">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full bg-muted-light p-2 dark:bg-muted-dark ${getIconColor()}`}
            >
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-card-fg-light dark:text-card-fg-dark">
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-muted-fg-light transition-colors hover:bg-muted-light hover:text-fg-light dark:text-muted-fg-dark dark:hover:bg-muted-dark dark:hover:text-fg-dark"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        <p className="mb-6 leading-relaxed text-muted-fg-light dark:text-muted-fg-dark">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg bg-muted-light px-4 py-2.5 font-medium text-fg-light transition-colors hover:bg-muted-light/80 dark:bg-muted-dark dark:text-fg-dark dark:hover:bg-muted-dark/80"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-colors ${getConfirmButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
