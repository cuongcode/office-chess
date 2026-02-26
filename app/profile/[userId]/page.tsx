'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Calendar, Trophy, TrendingUp, Flame, Copy, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/Button";

interface ProfileData {
    id: string;
    username: string;
    email: string;
    name: string | null;
    avatar: string | null;
    bio: string | null;
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    rating: number;
    winRate: number;
    currentStreak: number;
    longestStreak: number;
    lastGameAt: string | null;
    createdAt: string;
}

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const [userId, setUserId] = useState<string>('');
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        params.then(p => setUserId(p.userId));
    }, [params]);

    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            try {
                const response = await fetch(`/api/profile/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const data = await response.json();
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const isOwnProfile = session?.user?.email === profile?.email;

    const handleShareProfile = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Profile URL copied to clipboard!');
    };

    const getRelativeTime = (date: string | null) => {
        if (!date) return 'Never';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Profile Not Found</h1>
                    <p className="text-slate-400 mb-6">The user you're looking for doesn't exist.</p>
                    <Link href="/" className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-primary-fg-light dark:text-primary-fg-dark rounded-lg hover:opacity-90 transition">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const winPercentage = profile.totalGames > 0 ? (profile.wins / profile.totalGames) * 100 : 0;
    const drawPercentage = profile.totalGames > 0 ? (profile.draws / profile.totalGames) * 100 : 0;
    const lossPercentage = profile.totalGames > 0 ? (profile.losses / profile.totalGames) * 100 : 0;

    return (
        <div className="min-h-[calc(100vh-80px)] py-12 px-4 mt-10">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-card-light dark:bg-card-dark backdrop-blur-sm rounded-2xl p-8 mb-6 border border-border-light dark:border-border-dark">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            {profile.avatar ? (
                                <img
                                    src={profile.avatar}
                                    alt={profile.username}
                                    className="w-32 h-32 rounded-full border-4 border-primary-light dark:border-primary-dark object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-primary-light dark:border-primary-dark bg-gradient-to-br from-primary-light to-purple-600 flex items-center justify-center">
                                    <User className="w-16 h-16 text-white" />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold text-fg-light dark:text-fg-dark mb-2">{profile.username}</h1>
                            <p className="text-muted-fg-light dark:text-muted-fg-dark mb-3">{profile.email}</p>
                            {profile.bio && (
                                <p className="text-fg-light dark:text-fg-dark mb-4 max-w-2xl">{profile.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                {isOwnProfile && (
                                    <Link
                                        href="/profile/edit"
                                        className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-primary-fg-light dark:text-primary-fg-dark rounded-lg hover:opacity-90 transition flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Profile
                                    </Link>
                                )}
                                {/* <Button
                                    variant="secondary"
                                    onClick={handleShareProfile}
                                    className="px-4 py-2 flex items-center gap-2 !border-0"
                                >
                                    <Copy className="w-4 h-4" />
                                    Share Profile
                                </Button> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Card */}
                <div className="bg-card-light dark:bg-card-dark backdrop-blur-sm rounded-2xl p-8 mb-6 border border-border-light dark:border-border-dark">
                    <h2 className="text-2xl font-bold text-fg-light dark:text-fg-dark mb-6 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Statistics
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        {/* Rating */}
                        <div className="text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-primary-light to-purple-500 bg-clip-text text-transparent mb-2">
                                {profile.rating}
                            </div>
                            <div className="text-muted-fg-light dark:text-muted-fg-dark text-sm">Rating</div>
                        </div>

                        {/* Total Games */}
                        <div className="text-center">
                            <div className="text-5xl font-bold text-fg-light dark:text-fg-dark mb-2">{profile.totalGames}</div>
                            <div className="text-muted-fg-light dark:text-muted-fg-dark text-sm">Total Games</div>
                        </div>

                        {/* Win Rate */}
                        <div className="text-center">
                            <div className={`text-5xl font-bold mb-2 ${profile.winRate > 50 ? 'text-success' : 'text-destructive'}`}>
                                {profile.winRate.toFixed(1)}%
                            </div>
                            <div className="text-muted-fg-light dark:text-muted-fg-dark text-sm">Win Rate</div>
                        </div>

                        {/* Record */}
                        <div className="text-center">
                            <div className="text-3xl font-bold text-fg-light dark:text-fg-dark mb-2">
                                {profile.wins}-{profile.losses}-{profile.draws}
                            </div>
                            <div className="text-muted-fg-light dark:text-muted-fg-dark text-sm">W-L-D</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Current Streak */}
                        <div className="bg-secondary-light dark:bg-secondary-dark rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-muted-fg-light dark:text-muted-fg-dark text-sm">Current Streak</span>
                                {profile.currentStreak > 3 && <Flame className="w-5 h-5 text-orange-500" />}
                            </div>
                            <div className="text-3xl font-bold text-secondary-fg-light dark:text-secondary-fg-dark">{profile.currentStreak}</div>
                        </div>

                        {/* Longest Streak */}
                        <div className="bg-secondary-light dark:bg-secondary-dark rounded-lg p-4">
                            <div className="text-muted-fg-light dark:text-muted-fg-dark text-sm mb-2">Longest Streak</div>
                            <div className="text-3xl font-bold text-secondary-fg-light dark:text-secondary-fg-dark">{profile.longestStreak}</div>
                        </div>

                        {/* Last Game */}
                        <div className="bg-secondary-light dark:bg-secondary-dark rounded-lg p-4">
                            <div className="flex items-center gap-2 text-muted-fg-light dark:text-muted-fg-dark text-sm mb-2">
                                <Calendar className="w-4 h-4" />
                                Last Game
                            </div>
                            <div className="text-lg font-semibold text-secondary-fg-light dark:text-secondary-fg-dark">{getRelativeTime(profile.lastGameAt)}</div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="bg-card-light dark:bg-card-dark backdrop-blur-sm rounded-2xl p-8 mb-6 border border-border-light dark:border-border-dark">
                    <h3 className="text-xl font-bold text-fg-light dark:text-fg-dark mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                        Performance Breakdown
                    </h3>
                    <div className="space-y-4">
                        {/* Wins Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-success">Wins</span>
                                <span className="text-muted-fg-light dark:text-muted-fg-dark">{profile.wins} ({winPercentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-3 bg-muted-light dark:bg-muted-dark rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-success to-success/70 transition-all duration-500"
                                    style={{ width: `${winPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Draws Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-yellow-400">Draws</span>
                                <span className="text-muted-fg-light dark:text-muted-fg-dark">{profile.draws} ({drawPercentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-3 bg-muted-light dark:bg-muted-dark rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500"
                                    style={{ width: `${drawPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Losses Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-destructive">Losses</span>
                                <span className="text-muted-fg-light dark:text-muted-fg-dark">{profile.losses} ({lossPercentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-3 bg-muted-light dark:bg-muted-dark rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-destructive to-destructive/70 transition-all duration-500"
                                    style={{ width: `${lossPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-card-light dark:bg-card-dark backdrop-blur-sm rounded-2xl p-8 border border-border-light dark:border-border-dark">
                    <h3 className="text-xl font-bold text-fg-light dark:text-fg-dark mb-4">Recent Activity</h3>
                    <div className="text-center py-12">
                        <p className="text-muted-fg-light dark:text-muted-fg-dark">Recent games will appear here</p>
                        <p className="text-muted-fg-light dark:text-muted-fg-dark text-sm mt-2">Coming soon in Step 8</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
