'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const getConfirmButtonStyles = () => {
        switch (confirmVariant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 text-white';
            case 'primary':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            default:
                return 'bg-red-600 hover:bg-red-700 text-white';
        }
    };

    const getIconColor = () => {
        switch (confirmVariant) {
            case 'danger':
                return 'text-red-400';
            case 'warning':
                return 'text-yellow-400';
            case 'primary':
                return 'text-blue-400';
            default:
                return 'text-red-400';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-6 max-w-md w-full shadow-2xl transform scale-100 text-card-fg-light dark:text-card-fg-dark">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-muted-light dark:bg-muted-dark ${getIconColor()}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-card-fg-light dark:text-card-fg-dark">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-muted-fg-light dark:text-muted-fg-dark hover:text-fg-light dark:hover:text-fg-dark transition-colors p-1 hover:bg-muted-light dark:hover:bg-muted-dark rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message */}
                <p className="text-muted-fg-light dark:text-muted-fg-dark mb-6 leading-relaxed">{message}</p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-muted-light dark:bg-muted-dark hover:bg-muted-light/80 dark:hover:bg-muted-dark/80 text-fg-light dark:text-fg-dark rounded-lg font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${getConfirmButtonStyles()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
