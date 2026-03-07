import { NextResponse } from "next/server";

import { getAllRooms } from "@/lib/gameRooms";

export const dynamic = "force-dynamic";

export async function GET() {
  const rooms = getAllRooms();

  // Filter and map rooms for public display
  const activeGames = rooms
    .filter((room) => room.whitePlayer && room.blackPlayer) // Only show active games, or maybe wait rooms too?
    // Let's show all for now so people can see waiting rooms potentially?
    // Actually, usually "Active Games" implies playing. "Lobby" implies waiting.
    // For simplicity, let's show all non-empty rooms.
    .map((room) => ({
      roomId: room.roomId,
      whitePlayer: room.whitePlayer?.name || "Waiting...",
      blackPlayer: room.blackPlayer?.name || "Waiting...",
      spectatorCount: room.spectators.length,
      status: "active", // Set status to 'active' for filtered games to match frontend expectation
      createdAt: room.createdAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return NextResponse.json(activeGames);
}
