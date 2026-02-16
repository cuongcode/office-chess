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

export default function ConfirmationModal({
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
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl transform scale-100 text-card-foreground">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-muted ${getIconColor()}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-card-foreground">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message */}
                <p className="text-muted-foreground mb-6 leading-relaxed">{message}</p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
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
