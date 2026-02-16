'use client';

import React from 'react';
import { formatTime, getWarningLevel, WarningLevel } from '@/lib/timeControls';

interface ChessClockProps {
    timeLeft: number; // seconds
    playerName: string | null;
    isActive: boolean;
    increment?: number;
    isPaused?: boolean;
    orientation: 'top' | 'bottom';
}

export const ChessClock: React.FC<ChessClockProps> = ({
    timeLeft,
    playerName,
    isActive,
    increment = 0,
    isPaused = false,
    orientation
}) => {
    const warningLevel: WarningLevel = getWarningLevel(timeLeft);
    const formattedTime = formatTime(timeLeft);
    const isTimeout = timeLeft <= 0;

    // Determine background color based on warning level and active state
    const getBackgroundColor = () => {
        if (isTimeout) return 'bg-red-900';
        if (!isActive) return 'bg-slate-800';

        switch (warningLevel) {
            case 'critical':
                return 'bg-red-600 animate-pulse-fast';
            case 'urgent':
                return 'bg-red-500 animate-pulse';
            case 'warning':
                return 'bg-orange-500';
            default:
                return 'bg-blue-600';
        }
    };

    // Determine border style
    const getBorderStyle = () => {
        if (isActive && !isTimeout) {
            return 'ring-4 ring-blue-400 ring-opacity-75';
        }
        return 'ring-1 ring-slate-600';
    };

    // Determine text color
    const getTextColor = () => {
        if (isTimeout) return 'text-red-200';
        if (warningLevel === 'critical' || warningLevel === 'urgent') return 'text-white';
        if (warningLevel === 'warning') return 'text-white';
        return 'text-white';
    };

    return (
        <div
            className={`
                relative px-6 py-4 rounded-lg transition-all duration-300
                ${getBackgroundColor()}
                ${getBorderStyle()}
                ${isActive ? 'shadow-xl' : 'shadow-md'}
            `}
        >
            {/* Player Name */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200">
                    {playerName || 'Waiting...'}
                </span>

                {/* Increment Badge */}
                {increment > 0 && (
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                        +{increment}s
                    </span>
                )}
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-center">
                <span className={`text-5xl font-mono font-bold ${getTextColor()} tabular-nums`}>
                    {isTimeout ? '00:00' : formattedTime}
                </span>
            </div>

            {/* Status Indicators */}
            <div className="mt-2 flex items-center justify-center gap-2">
                {isPaused && (
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Paused
                    </span>
                )}

                {isTimeout && (
                    <span className="text-sm font-bold text-red-200 animate-pulse">
                        TIME OUT!
                    </span>
                )}

                {isActive && !isTimeout && !isPaused && (
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Active
                    </span>
                )}
            </div>

            {/* Warning Indicator */}
            {warningLevel === 'critical' && !isTimeout && (
                <div className="absolute -top-1 -right-1">
                    <span className="flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                </div>
            )}
        </div>
    );
};
