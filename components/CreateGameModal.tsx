"use client";

import { Check, Copy, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { TimeControlPreset, timeControlPresets } from "@/lib/timeControls";
import { useGameStore } from "@/store/gameStore";

import { ColorPickerButton } from "./ColorPickerButton";
import { TimeControlSelector } from "./TimeControlSelector";

interface CreateGameModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export function CreateGameModal({
  userId,
  userName,
  onClose,
}: CreateGameModalProps) {
  const { createGame, roomId, isOnline, isConnected } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [selectedColor, setSelectedColor] = useState<
    "white" | "black" | "random"
  >("random");
  const [gameCreated, setGameCreated] = useState(false);
  const [selectedTimeControl, setSelectedTimeControl] =
    useState<TimeControlPreset | null>(
      timeControlPresets.find((p) => p.id === "blitz-3-2") || null,
    );

  useEffect(() => {
    // Only create game if we don't have a room yet AND we are connected AND user hasn't created yet
    if (!roomId && isConnected && gameCreated) {
      createGame(userId, userName, selectedColor, selectedTimeControl);
    }
  }, [
    createGame,
    roomId,
    userId,
    userName,
    isConnected,
    gameCreated,
    selectedColor,
    selectedTimeControl,
  ]);

  const copyToClipboard = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Room code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = () => {
    if (roomId) {
      const url = `${window.location.origin}?room=${roomId}`;
      navigator.clipboard.writeText(url);
      toast.success("Game link copied!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border-light bg-card-light p-8 text-card-fg-light dark:border-border-dark dark:bg-card-dark dark:text-card-fg-dark">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="h-6 w-6" />
        </Button>

        <h2 className="mb-6 text-center text-2xl font-bold">Create Game</h2>

        {!roomId ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-3 text-center text-muted-fg-light dark:text-muted-fg-dark">
                Choose your color
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(["white", "black", "random"] as const).map((color) => (
                  <ColorPickerButton
                    key={color}
                    color={color}
                    isSelected={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Time Control Selector */}
            <div>
              <TimeControlSelector
                selectedPreset={selectedTimeControl}
                onSelect={setSelectedTimeControl}
              />
            </div>

            <Button
              onClick={() => setGameCreated(true)}
              disabled={!isConnected}
              className="w-full"
            >
              {!isConnected ? "Connecting..." : "Create Game"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-border-light bg-muted-light p-6 text-center dark:border-border-dark dark:bg-muted-dark">
              <p className="mb-2 text-muted-fg-light dark:text-muted-fg-dark">
                Room Code
              </p>
              <div
                onClick={copyToClipboard}
                className="cursor-pointer font-mono text-4xl font-bold tracking-wider text-card-fg-light select-all hover:scale-105 dark:text-card-fg-dark"
              >
                {roomId}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={copyToClipboard}
                className="flex flex-1 items-center justify-center gap-2"
              >
                {copied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
                {copied ? "Copied" : "Copy Code"}
              </Button>

              <Button
                onClick={copyLink}
                className="flex flex-1 items-center justify-center gap-2 !border-0 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Share2 className="h-5 w-5" />
                Share Link
              </Button>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-500">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-500"></span>
                </span>
                Waiting for opponent...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
