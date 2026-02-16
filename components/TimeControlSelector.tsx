'use client';

import React, { useState } from 'react';
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
    const [selectedCategory, setSelectedCategory] = useState<TimeControlCategory>('blitz');

    // Group presets
    const groupedPresets: Record<string, TimeControlPreset[]> = {};
    timeControlPresets.forEach(preset => {
        if (!groupedPresets[preset.category]) {
            groupedPresets[preset.category] = [];
        }
        groupedPresets[preset.category].push(preset);
    });

    return (
        <div className="space-y-4">
            <p className="text-muted-foreground text-center">Select Time Control</p>

            <div className="grid grid-cols-3 gap-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {groupedPresets[selectedCategory]?.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => onSelect(preset)}
                        className={`p-3 rounded-lg border text-left transition-all ${selectedPreset?.id === preset.id
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border hover:border-muted-foreground/50 bg-card'
                            }`}
                    >
                        <div className="font-bold text-card-foreground">
                            {getTimeControlDisplay(preset)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {preset.increment > 0 ? `${preset.increment}s increment` : 'No increment'}
                        </div>
                    </button>
                ))}
            </div>

            {/* Selected Preset Info */}
            {selectedPreset && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm text-muted-foreground">Selected:</span>
                            <span className="ml-2 text-foreground font-semibold">
                                {selectedPreset.name} ({getTimeControlDisplay(selectedPreset)})
                            </span>
                        </div>
                        {selectedPreset.category !== 'unlimited' && (
                            <div className="text-xs text-muted-foreground">
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
