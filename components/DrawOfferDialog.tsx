"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useGameStore } from "@/store/gameStore";

export function DrawOfferDialog() {
  const { socket, roomId, acceptDraw, playerColor } = useGameStore();
  const [show, setShow] = useState(false);
  const [opponentColor, setOpponentColor] = useState<string>("");

  useEffect(() => {
    if (!socket) return;

    const handleDrawOffer = ({ color }: { color: string }) => {
      setOpponentColor(color);
      setShow(true);
    };

    const handleDrawDeclined = () => {
      toast.error("Draw offer declined");
      setShow(false);
    };

    socket.on("draw_offered", handleDrawOffer);
    socket.on("draw_declined", handleDrawDeclined);

    return () => {
      socket.off("draw_offered", handleDrawOffer);
      socket.off("draw_declined", handleDrawDeclined);
    };
  }, [socket]);

  const handleRespond = (accept: boolean) => {
    if (accept) {
      // Use store action so status is frozen immediately on both clients
      acceptDraw();
    } else if (socket && roomId) {
      socket.emit("respond_draw", { roomId, accept: false });
    }
    setShow(false);
  };

  if (!show || playerColor === "spectator") return null;

  return (
    <div className="animate-slide-down fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-yellow-500 bg-card-light p-4 dark:bg-card-dark">
        <div>
          <h3 className="text-lg font-bold text-card-fg-light dark:text-card-fg-dark">
            Draw Offered
          </h3>
          <p className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
            Your opponent offers a draw.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleRespond(true)}
            className="cursor-pointer rounded-lg bg-success p-2 text-white transition-colors hover:bg-success/80"
            title="Accept Draw"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleRespond(false)}
            className="text-destructive-fg-light dark:text-destructive-fg-dark cursor-pointer rounded-lg bg-destructive p-2 transition-colors hover:opacity-90 dark:bg-destructive/80"
            title="Decline Draw"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
