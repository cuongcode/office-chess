import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const userId = searchParams.get("userId") || (session?.user as any)?.id;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const result = (searchParams.get("result") || "all") as
      | "win"
      | "loss"
      | "draw"
      | "all";
    const sortBy = (searchParams.get("sortBy") || "recent") as
      | "recent"
      | "oldest";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required or must be logged in" },
        { status: 400 },
      );
    }

    // Validate result filter
    if (!["win", "loss", "draw", "all"].includes(result)) {
      return NextResponse.json(
        { error: "Invalid result filter. Must be: win, loss, draw, or all" },
        { status: 400 },
      );
    }

    // Build where clause
    // Base condition: user is either white or black player
    let whereClause: any = {
      OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
    };

    // Apply result filter
    if (result === "win") {
      whereClause = {
        AND: [
          {
            OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
          },
          {
            OR: [
              { whitePlayerId: userId, result: "white_win" },
              { blackPlayerId: userId, result: "black_win" },
            ],
          },
        ],
      };
    } else if (result === "loss") {
      whereClause = {
        AND: [
          {
            OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
          },
          {
            OR: [
              { whitePlayerId: userId, result: "black_win" },
              { blackPlayerId: userId, result: "white_win" },
              { whitePlayerId: userId, result: "timeout_white" },
              { blackPlayerId: userId, result: "timeout_black" },
            ],
          },
        ],
      };
    } else if (result === "draw") {
      whereClause = {
        OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
        result: "draw",
      };
    }

    const orderDirection = sortBy === "oldest" ? "asc" : "desc";
    const skip = (page - 1) * limit;

    // Fetch total count and games in parallel
    const [totalGames, games] = await Promise.all([
      prisma.game.count({ where: whereClause }),
      prisma.game.findMany({
        where: whereClause,
        orderBy: { createdAt: orderDirection },
        skip,
        take: limit,
        include: {
          whitePlayer: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          blackPlayer: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalGames / limit));

    // Annotate each game with the current user's perspective (win/loss/draw)
    const gamesWithPerspective = games.map((game) => {
      const isWhite = game.whitePlayerId === userId;
      let userResult: "win" | "loss" | "draw";

      if (game.result === "draw") {
        userResult = "draw";
      } else if (
        (isWhite && game.result === "white_win") ||
        (!isWhite && game.result === "black_win")
      ) {
        userResult = "win";
      } else {
        userResult = "loss";
      }

      return {
        ...game,
        userResult,
        userColor: isWhite ? "white" : "black",
      };
    });

    return NextResponse.json({
      games: gamesWithPerspective,
      pagination: {
        page,
        totalPages,
        totalGames,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Game history API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch game history" },
      { status: 500 },
    );
  }
}
