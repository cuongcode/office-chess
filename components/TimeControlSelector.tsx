'use client';

import React from 'react';
import {
    TimeControlPreset,
    timeControlPresets,
    getTimeControlDisplay,
    TimeControlCategory
} from '@/lib/timeControls';

interface TimeControlSelectorProps {
    selectedPreset: TimeControlPreset | null;
    onSelect: (preset: TimeControlPreset | null) => void;
}

export const TimeControlSelector: React.FC<TimeControlSelectorProps> = ({
    selectedPreset,
    onSelect
}) => {
    // Group presets by category
    const categories: TimeControlCategory[] = ['bullet', 'blitz', 'rapid', 'classical', 'unlimited'];

    const getCategoryIcon = (category: TimeControlCategory) => {
        switch (category) {
            case 'bullet':
                return '⚡';
            case 'blitz':
                return '🔥';
            case 'rapid':
                return '⏱️';
            case 'classical':
                return '♟️';
            case 'unlimited':
                return '∞';
            default:
                return '🕐';
        }
    };

    const getCategoryColor = (category: TimeControlCategory) => {
        switch (category) {
            case 'bullet':
                return 'from-red-500 to-orange-500';
            case 'blitz':
                return 'from-orange-500 to-yellow-500';
            case 'rapid':
                return 'from-blue-500 to-cyan-500';
            case 'classical':
                return 'from-purple-500 to-pink-500';
            case 'unlimited':
                return 'from-slate-600 to-slate-700';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Select Time Control</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {timeControlPresets.map((preset) => {
                    const isSelected = selectedPreset?.id === preset.id;
                    const displayTime = getTimeControlDisplay(preset);
                    const categoryIcon = getCategoryIcon(preset.category);
                    const categoryColor = getCategoryColor(preset.category);

                    return (
                        <button
                            key={preset.id}
                            onClick={() => onSelect(preset)}
                            className={`
                                relative p-4 rounded-lg transition-all duration-200
                                ${isSelected
                                    ? 'ring-4 ring-blue-500 scale-105 shadow-xl'
                                    : 'ring-1 ring-slate-600 hover:ring-slate-500 hover:scale-102'
                                }
                                bg-gradient-to-br ${categoryColor}
                                hover:shadow-lg
                                focus:outline-none focus:ring-4 focus:ring-blue-400
                            `}
                        >
                            {/* Category Icon */}
                            <div className="text-3xl mb-2 text-center">
                                {categoryIcon}
                            </div>

                            {/* Time Display */}
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white mb-1">
                                    {displayTime}
                                </div>
                                <div className="text-xs text-white/80 capitalize">
                                    {preset.name}
                                </div>
                            </div>

                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="absolute -top-2 -right-2">
                                    <div className="bg-blue-500 rounded-full p-1">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Preset Info */}
            {selectedPreset && (
                <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm text-slate-400">Selected:</span>
                            <span className="ml-2 text-white font-semibold">
                                {selectedPreset.name} ({getTimeControlDisplay(selectedPreset)})
                            </span>
                        </div>
                        {selectedPreset.category !== 'unlimited' && (
                            <div className="text-xs text-slate-400">
                                {selectedPreset.initialTime / 60} min
                                {selectedPreset.increment > 0 && ` + ${selectedPreset.increment}s per move`}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
