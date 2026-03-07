import { NextRequest, NextResponse } from 'next/server';

import { searchPlayers } from '@/lib/leaderboard';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        // Validate query
        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        // Minimum 2 characters for search
        if (query.trim().length < 2) {
            return NextResponse.json(
                { error: 'Search query must be at least 2 characters' },
                { status: 400 }
            );
        }

        // Search players
        const players = await searchPlayers(query.trim(), 10);

        return NextResponse.json({
            players,
            query: query.trim(),
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search players' },
            { status: 500 }
        );
    }
}
