import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getUserRank, TimeFilter } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    const userId = (session.user as any).id;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filter = (searchParams.get("filter") || "all-time") as TimeFilter;

    // Validate filter
    if (!["all-time", "monthly", "weekly"].includes(filter)) {
      return NextResponse.json(
        { error: "Invalid filter. Must be: all-time, monthly, or weekly" },
        { status: 400 },
      );
    }

    // Get user rank
    const rankResult = await getUserRank(userId, filter);

    if (!rankResult) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      rank: rankResult.rank,
      totalPlayers: rankResult.totalPlayers,
      percentile: Math.round(rankResult.percentile * 10) / 10, // Round to 1 decimal
      nearbyPlayers: rankResult.nearbyPlayers,
      filter,
    });
  } catch (error) {
    console.error("My rank API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user rank" },
      { status: 500 },
    );
  }
}
