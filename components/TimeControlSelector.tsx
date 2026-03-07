"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  getTimeControlDisplay,
  TimeControlCategory,
  TimeControlPreset,
  timeControlPresets,
} from "@/lib/timeControls";

interface TimeControlSelectorProps {
  selectedPreset: TimeControlPreset | null;
  onSelect: (preset: TimeControlPreset | null) => void;
}

export const TimeControlSelector: React.FC<TimeControlSelectorProps> = ({
  selectedPreset,
  onSelect,
}) => {
  // Group presets by category
  const categories: TimeControlCategory[] = [
    "bullet",
    "blitz",
    "rapid",
    "classical",
    "unlimited",
  ];
  const [selectedCategory, setSelectedCategory] =
    useState<TimeControlCategory>("blitz");

  // Group presets
  const groupedPresets: Record<string, TimeControlPreset[]> = {};
  timeControlPresets.forEach((preset) => {
    if (!groupedPresets[preset.category]) {
      groupedPresets[preset.category] = [];
    }
    groupedPresets[preset.category].push(preset);
  });

  return (
    <div className="min-h-[300px] space-y-4">
      <p className="text-center text-muted-fg-light dark:text-muted-fg-dark">
        Select Time Control
      </p>

      <div className="grid grid-cols-3 gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "primary" : "secondary"}
            onClick={() => setSelectedCategory(category)}
            className={`text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "" // primary variant handles bg color
                : "border-transparent bg-muted-light text-muted-fg-light hover:bg-muted-light/80 dark:bg-muted-dark dark:text-muted-fg-dark dark:hover:bg-muted-dark/80"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid max-h-48 grid-cols-2 gap-3 overflow-y-auto pr-1">
        {groupedPresets[selectedCategory]?.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`rounded-lg border p-3 text-left transition-all ${
              selectedPreset?.id === preset.id
                ? "border-primary-light bg-primary-light/10 dark:border-primary-dark dark:bg-primary-dark/10"
                : "border-border-light bg-card-light hover:border-muted-fg-light/50 dark:border-border-dark dark:bg-card-dark dark:hover:border-muted-fg-dark/50"
            }`}
          >
            <div className="font-bold text-card-fg-light dark:text-card-fg-dark">
              {getTimeControlDisplay(preset)}
            </div>
            <div className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
              {preset.increment > 0
                ? `+ ${preset.increment}s per move`
                : "No increment"}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Preset Info */}
      {/* {selectedPreset && (
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
            )} */}
    </div>
  );
};
