"use client";

import { AlertCircle, ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, Modal } from "@/components/ui";
import { useGameStore } from "@/store/gameStore";

interface JoinGameModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export function JoinGameModal({
  userId,
  userName,
  onClose,
}: JoinGameModalProps) {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { joinGame, joinError, clearJoinError, isOnline } = useGameStore();

  // Close modal on successful join
  useEffect(() => {
    if (isOnline && isJoining) {
      onClose();
    }
  }, [isOnline, isJoining, onClose]);

  // Clear loading state when error occurs
  useEffect(() => {
    if (joinError) {
      setIsJoining(false);
    }
  }, [joinError]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomIdInput.trim()) {
      setIsJoining(true);
      clearJoinError();
      joinGame(roomIdInput.trim().toUpperCase(), userId, userName);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomIdInput(e.target.value.toUpperCase());
    // Clear error when user starts typing
    if (joinError) {
      clearJoinError();
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    clearJoinError();
    setIsJoining(false);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={handleClose}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="absolute top-4 right-4"
      >
        <X className="h-6 w-6" />
      </Button>

      <h2 className="mb-6 text-center text-2xl font-bold">Join Game</h2>

      <form onSubmit={handleJoin} className="space-y-6">
        <div>
          <label
            htmlFor="roomId"
            className="mb-2 block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark"
          >
            Room Code
          </label>
          <input
            type="text"
            id="roomId"
            value={roomIdInput}
            onChange={handleInputChange}
            placeholder="Ex: A1B2C3"
            className={`w-full border bg-bg-light dark:bg-bg-dark ${
              joinError
                ? "border-destructive dark:border-destructive"
                : "border-input-light dark:border-input-dark"
            } rounded-lg px-4 py-3 text-fg-light placeholder:text-muted-fg-light focus:ring-2 focus:outline-none dark:text-fg-dark dark:placeholder:text-muted-fg-dark ${
              joinError
                ? "focus:ring-destructive dark:focus:ring-destructive"
                : "focus:ring-primary-light dark:focus:ring-primary-dark"
            } text-center font-mono text-xl tracking-wider uppercase`}
            autoFocus
            maxLength={6}
            disabled={isJoining}
          />
          {joinError && (
            <div className="mt-2 flex items-start gap-2 text-sm text-destructive dark:text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{joinError}</span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!roomIdInput.trim() || isJoining}
          className="flex w-full items-center justify-center gap-2"
        >
          {isJoining ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              Joining...
            </>
          ) : (
            <>
              Join Game
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </Modal>
  );
}
