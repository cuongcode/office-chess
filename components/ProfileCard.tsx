'use client';

import { useEffect, useState } from 'react';
import { User, Trophy } from 'lucide-react';
import Link from 'next/link';

interface ProfileCardProps {
    userId?: string;
    playerData?: {
        id: string;
        username: string;
        avatar: string | null;
        rating: number;
        wins: number;
        losses: number;
        draws: number;
    };
}

export function ProfileCard({ userId, playerData }: ProfileCardProps) {
    const [profile, setProfile] = useState(playerData);
    const [loading, setLoading] = useState(!playerData && !!userId);

    useEffect(() => {
        if (!userId || playerData) return;

        const fetchProfile = async () => {
            try {
                const response = await fetch(`/api/profile/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile({
                        id: data.id,
                        username: data.username,
                        avatar: data.avatar,
                        rating: data.rating,
                        wins: data.wins,
                        losses: data.losses,
                        draws: data.draws,
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId, playerData]);

    if (loading) {
        return (
            <div className="bg-card-light dark:bg-card-dark rounded-lg p-4 border border-border-light dark:border-border-dark animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted-light dark:bg-muted-dark" />
                    <div className="flex-1">
                        <div className="h-4 bg-muted-light dark:bg-muted-dark rounded w-24 mb-2" />
                        <div className="h-3 bg-muted-light dark:bg-muted-dark rounded w-16" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <Link
            href={`/profile/${profile.id}`}
            className="bg-card-light dark:bg-card-dark rounded-lg p-4 border border-border-light dark:border-border-dark hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer block"
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                {profile.avatar ? (
                    <img
                        src={profile.avatar}
                        alt={profile.username}
                        className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-card-fg-light dark:text-card-fg-dark font-semibold truncate">{profile.username}</h3>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Trophy className="w-3 h-3" />
                            <span className="font-medium">{profile.rating}</span>
                        </div>
                        <div className="text-muted-fg-light dark:text-muted-fg-dark">
                            {profile.wins}-{profile.losses}-{profile.draws}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
