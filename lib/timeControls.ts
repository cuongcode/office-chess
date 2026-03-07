export type TimeControlCategory =
  | "bullet"
  | "blitz"
  | "rapid"
  | "classical"
  | "unlimited";

export interface TimeControlPreset {
  id: string;
  name: string;
  initialTime: number; // seconds
  increment: number; // seconds added per move
  category: TimeControlCategory;
}

// Predefined time control presets
export const timeControlPresets: TimeControlPreset[] = [
  // Bullet
  {
    id: "bullet-1",
    name: "Bullet",
    initialTime: 60, // 1 minute
    increment: 0,
    category: "bullet",
  },
  {
    id: "bullet-1-1",
    name: "Bullet",
    initialTime: 60, // 1 minute
    increment: 1,
    category: "bullet",
  },
  {
    id: "bullet-2-1",
    name: "Bullet",
    initialTime: 120, // 2 minutes
    increment: 1,
    category: "bullet",
  },

  // Blitz
  {
    id: "blitz-3",
    name: "Blitz",
    initialTime: 180, // 3 minutes
    increment: 0,
    category: "blitz",
  },
  {
    id: "blitz-3-2",
    name: "Blitz",
    initialTime: 180, // 3 minutes
    increment: 2,
    category: "blitz",
  },
  {
    id: "blitz-5",
    name: "Blitz",
    initialTime: 300, // 5 minutes
    increment: 0,
    category: "blitz",
  },
  {
    id: "blitz-5-3",
    name: "Blitz",
    initialTime: 300, // 5 minutes
    increment: 3,
    category: "blitz",
  },

  // Rapid
  {
    id: "rapid-10",
    name: "Rapid",
    initialTime: 600, // 10 minutes
    increment: 0,
    category: "rapid",
  },
  {
    id: "rapid-10-5",
    name: "Rapid",
    initialTime: 600, // 10 minutes
    increment: 5,
    category: "rapid",
  },
  {
    id: "rapid-15-10",
    name: "Rapid",
    initialTime: 900, // 15 minutes
    increment: 10,
    category: "rapid",
  },

  // Classical
  {
    id: "classical-30",
    name: "Classical",
    initialTime: 1800, // 30 minutes
    increment: 0,
    category: "classical",
  },

  // Unlimited
  {
    id: "unlimited",
    name: "Unlimited",
    initialTime: 0, // No time limit
    increment: 0,
    category: "unlimited",
  },
];

/**
 * Formats seconds into MM:SS format
 * @param seconds - Total seconds
 * @returns Formatted time string (e.g., "03:45")
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 0) seconds = 0;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Gets display string for time control (e.g., "3+2", "10+0", "Unlimited")
 * @param preset - Time control preset
 * @returns Display string
 */
export const getTimeControlDisplay = (preset: TimeControlPreset): string => {
  if (preset.category === "unlimited") {
    return "Unlimited";
  }

  const minutes = preset.initialTime / 60;
  return `${minutes}+${preset.increment}`;
};

/**
 * Checks if time is considered "low" (below threshold)
 * @param seconds - Current time in seconds
 * @param threshold - Threshold in seconds (default: 20)
 * @returns True if time is low
 */
export const isLowTime = (seconds: number, threshold: number = 20): boolean => {
  return seconds > 0 && seconds < threshold;
};

/**
 * Gets warning level based on remaining time
 * @param seconds - Current time in seconds
 * @returns Warning level
 */
export type WarningLevel = "normal" | "warning" | "urgent" | "critical";

export const getWarningLevel = (seconds: number): WarningLevel => {
  if (seconds <= 0) return "critical";
  if (seconds < 5) return "critical";
  if (seconds < 10) return "urgent";
  if (seconds < 20) return "warning";
  return "normal";
};

/**
 * Finds a time control preset by ID
 * @param id - Preset ID
 * @returns Time control preset or undefined
 */
export const getPresetById = (id: string): TimeControlPreset | undefined => {
  return timeControlPresets.find((preset) => preset.id === id);
};

/**
 * Gets all presets for a specific category
 * @param category - Time control category
 * @returns Array of presets
 */
export const getPresetsByCategory = (
  category: TimeControlCategory,
): TimeControlPreset[] => {
  return timeControlPresets.filter((preset) => preset.category === category);
};
