import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, TimeFilter } from '@/lib/leaderboard';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const filter = (searchParams.get('filter') || 'all-time') as TimeFilter;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50); // Max 50

        // Validate filter
        if (!['all-time', 'monthly', 'weekly'].includes(filter)) {
            return NextResponse.json(
                { error: 'Invalid filter. Must be: all-time, monthly, or weekly' },
                { status: 400 }
            );
        }

        // Validate page and limit
        if (page < 1 || limit < 1) {
            return NextResponse.json(
                { error: 'Page and limit must be positive integers' },
                { status: 400 }
            );
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Get leaderboard data
        const result = await getLeaderboard(filter, limit, offset);

        // Calculate pagination metadata
        const totalPages = Math.ceil(result.totalPlayers / limit);

        return NextResponse.json({
            players: result.players,
            pagination: {
                currentPage: page,
                totalPages,
                totalPlayers: result.totalPlayers,
                hasMore: result.hasMore,
                limit,
            },
            filter,
        });
    } catch (error) {
        console.error('Leaderboard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
