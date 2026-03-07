import { TimeControlPreset } from "./timeControls";

export interface Player {
  id: string;
  name: string;
  socketId: string;
}

export interface GameState {
  fen: string;
  moveHistory: string[];
  turn: "w" | "b";
  status:
    | "playing"
    | "checkmate"
    | "draw"
    | "stalemate"
    | "resignation"
    | "check";
  winner?: "white" | "black" | "draw";
  lastMove: { from: string; to: string } | null;
  capturedPieces: {
    white: string[]; // Pieces captured BY white (black's lost pieces)
    black: string[]; // Pieces captured BY black (white's lost pieces)
  };
}

export interface GameRoom {
  roomId: string;
  whitePlayer: Player | null;
  blackPlayer: Player | null;
  spectators: Player[];
  gameState: GameState;
  createdAt: Date;
  drawOffer?: "white" | "black"; // Color that offered the draw

  // Timer fields
  timeControl: TimeControlPreset | null;
  whiteTimeLeft: number; // seconds remaining
  blackTimeLeft: number; // seconds remaining
  timerStartedAt: number | null; // timestamp when timer started
  activeTimerColor: "white" | "black" | null;
  lastTimerUpdate: number; // timestamp of last timer update

  // Ready state
  whiteReady: boolean;
  blackReady: boolean;

  // Track when the game actually started (first move / timer start)
  gameStartedAt: number | null;

  // Prevent duplicate DB saves
  gameSaved: boolean;
}

// In-memory storage for game rooms
// In-memory storage for game rooms
// Note: In a production app with multiple server instances, this should be in Redis
// We use globalThis to ensure the map is shared between the Socket.IO server execution context
// and the Next.js API route execution context in development.

declare global {
  var socketGameRooms: Map<string, GameRoom> | undefined;
}

const gameRooms = globalThis.socketGameRooms || new Map<string, GameRoom>();

if (process.env.NODE_ENV !== "production") {
  globalThis.socketGameRooms = gameRooms;
}

// Helper to generate a random room ID
export const generateRoomId = (): string => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const createRoom = (
  creator: Player,
  colorPreference: "white" | "black" | "random" = "random",
  timeControl: TimeControlPreset | null = null,
): { room: GameRoom; color: "white" | "black" } => {
  let roomId = generateRoomId();
  while (gameRooms.has(roomId)) {
    roomId = generateRoomId();
  }

  // Determine the actual color based on preference
  let assignedColor: "white" | "black";
  if (colorPreference === "random") {
    assignedColor = Math.random() < 0.5 ? "white" : "black";
  } else {
    assignedColor = colorPreference;
  }

  const newRoom: GameRoom = {
    roomId,
    whitePlayer: assignedColor === "white" ? creator : null,
    blackPlayer: assignedColor === "black" ? creator : null,
    spectators: [],
    gameState: {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Start position
      moveHistory: [],
      turn: "w",
      status: "playing",
      lastMove: null,
      capturedPieces: {
        white: [],
        black: [],
      },
    },
    createdAt: new Date(),

    // Initialize timer state
    timeControl: timeControl,
    whiteTimeLeft:
      timeControl && timeControl.category !== "unlimited"
        ? timeControl.initialTime
        : 0,
    blackTimeLeft:
      timeControl && timeControl.category !== "unlimited"
        ? timeControl.initialTime
        : 0,
    timerStartedAt: null,
    activeTimerColor: null,
    lastTimerUpdate: Date.now(),

    // Initialize ready state
    whiteReady: false,
    blackReady: false,

    // Game hasn't started yet
    gameStartedAt: null,

    // No DB record yet
    gameSaved: false,
  };

  gameRooms.set(roomId, newRoom);
  return { room: newRoom, color: assignedColor };
};

export const getRoom = (roomId: string): GameRoom | undefined => {
  return gameRooms.get(roomId);
};

export const getAllRooms = (): GameRoom[] => {
  const rooms = Array.from(gameRooms.values());
  console.log("getAllRooms:", rooms.length, "rooms");
  return rooms;
};

export const joinRoom = (
  roomId: string,
  player: Player,
): { room: GameRoom; role: "white" | "black" | "spectator" } | null => {
  const room = gameRooms.get(roomId);
  if (!room) return null;

  // Check if player is already in the room (reconnection)
  if (room.whitePlayer?.id === player.id) {
    room.whitePlayer.socketId = player.socketId; // Update socket ID
    return { room, role: "white" };
  }
  if (room.blackPlayer?.id === player.id) {
    room.blackPlayer.socketId = player.socketId; // Update socket ID
    return { room, role: "black" };
  }

  // Assign role
  if (!room.whitePlayer) {
    room.whitePlayer = player;
    return { room, role: "white" };
  } else if (!room.blackPlayer) {
    room.blackPlayer = player;
    return { room, role: "black" };
  } else {
    // Add to spectators if not already there
    if (!room.spectators.some((s) => s.id === player.id)) {
      room.spectators.push(player);
    } else {
      // Update socket ID for existing spectator
      const spectator = room.spectators.find((s) => s.id === player.id);
      if (spectator) spectator.socketId = player.socketId;
    }
    return { room, role: "spectator" };
  }
};

// Join room explicitly as a player (not spectator)
export const joinRoomAsPlayer = (
  roomId: string,
  player: Player,
): { room: GameRoom; role: "white" | "black" } | null => {
  const room = gameRooms.get(roomId);
  if (!room) return null;

  // Check if player is already in the room (reconnection)
  if (room.whitePlayer?.id === player.id) {
    room.whitePlayer.socketId = player.socketId; // Update socket ID
    return { room, role: "white" };
  }
  if (room.blackPlayer?.id === player.id) {
    room.blackPlayer.socketId = player.socketId; // Update socket ID
    return { room, role: "black" };
  }

  // Assign to available player slot
  if (!room.whitePlayer) {
    room.whitePlayer = player;
    return { room, role: "white" };
  } else if (!room.blackPlayer) {
    room.blackPlayer = player;
    return { room, role: "black" };
  } else {
    // Both slots are full, cannot join as player
    return null;
  }
};

// Join room explicitly as a spectator
export const joinRoomAsSpectator = (
  roomId: string,
  player: Player,
): { room: GameRoom; role: "spectator" } | null => {
  const room = gameRooms.get(roomId);
  if (!room) return null;

  // Check if player is already a spectator (reconnection)
  const existingSpectator = room.spectators.find((s) => s.id === player.id);
  if (existingSpectator) {
    existingSpectator.socketId = player.socketId; // Update socket ID
    return { room, role: "spectator" };
  }

  // Add as new spectator
  room.spectators.push(player);
  return { room, role: "spectator" };
};

export const leaveRoom = (
  roomId: string,
  socketId: string,
): {
  room: GameRoom | null;
  resignedColor?: "white" | "black";
  resignedPlayer?: Player; // The player who left (captured before their slot is cleared)
  remainingPlayer?: Player; // The other player still in the room
  gameJustEnded?: boolean;
} => {
  const room = gameRooms.get(roomId);
  if (!room) return { room: null };

  let resignedColor: "white" | "black" | undefined;
  const wasPlaying = room.gameState.status === "playing";

  // If this is an explicit "leave game" action:
  let resignedPlayer: Player | undefined;
  if (room.whitePlayer?.socketId === socketId) {
    resignedColor = "white";
    resignedPlayer = room.whitePlayer; // snapshot before clearing
    room.whitePlayer = null;
  } else if (room.blackPlayer?.socketId === socketId) {
    resignedColor = "black";
    resignedPlayer = room.blackPlayer; // snapshot before clearing
    room.blackPlayer = null;
  } else {
    // Just a spectator leaving
    room.spectators = room.spectators.filter((s) => s.socketId !== socketId);
  }

  const remainingPlayer =
    resignedColor === "white"
      ? (room.blackPlayer ?? undefined)
      : (room.whitePlayer ?? undefined);

  // If a player resigned by leaving, update game state
  // Only trigger if the game was still active AND hasn't been saved yet
  let gameJustEnded = false;
  if (resignedColor && room.gameState.status === "playing" && !room.gameSaved) {
    const winner = resignedColor === "white" ? "black" : "white";
    room.gameState.status = "resignation";
    room.gameState.winner = winner;
    gameJustEnded = true; // Game just ended due to this leave
  }

  // If room is empty, delete it
  if (!room.whitePlayer && !room.blackPlayer && room.spectators.length === 0) {
    gameRooms.delete(roomId);
    return {
      room: null,
      resignedColor,
      resignedPlayer,
      remainingPlayer,
      gameJustEnded,
    };
  }

  return {
    room,
    resignedColor,
    resignedPlayer,
    remainingPlayer,
    gameJustEnded,
  };
};

// Handle socket disconnect (not explicit leave)
export const handleDisconnect = (socketId: string) => {
  // Find all rooms this socket is part of
  for (const [roomId, room] of gameRooms.entries()) {
    let changed = false;

    // We generally don't remove players on simple disconnect (refresh),
    // but we might want to notify others.
    // For this implementation, let's just return the affected rooms so the server can notify.

    // Actually, we should probably remove spectators on disconnect
    const initialSpecCount = room.spectators.length;
    room.spectators = room.spectators.filter((s) => s.socketId !== socketId);
    if (room.spectators.length !== initialSpecCount) changed = true;

    // We don't nullify players on disconnect to allow reconnection

    if (changed) return room;
  }
  return null;
};

export const updateGameState = (
  roomId: string,
  gameState: GameState,
): GameRoom | null => {
  const room = gameRooms.get(roomId);
  if (!room) return null;

  // Always keep the longer move history — the client who received a move via `move_made`
  // reconstructs their chess instance from FEN only, so their chess.history() resets to [].
  // The player who *made* the move sends the full history, but the *recipient* sends only
  // moves they've made since receiving the FEN. We therefore merge by keeping the longer list.
  const mergedHistory =
    (gameState.moveHistory?.length ?? 0) >=
    (room.gameState.moveHistory?.length ?? 0)
      ? gameState.moveHistory
      : room.gameState.moveHistory;

  room.gameState = {
    ...gameState,
    moveHistory: mergedHistory,
  };
  return room;
};

export const deleteRoom = (roomId: string) => {
  gameRooms.delete(roomId);
};
