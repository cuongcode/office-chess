"use client";

import {
  Calendar,
  Copy,
  Edit,
  Flame,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

export default function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setUserId(p.userId));
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
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
    toast.success("Profile URL copied to clipboard!");
  };

  const getRelativeTime = (date: string | null) => {
    if (!date) return "Never";
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-xl text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Profile Not Found
          </h1>
          <p className="mb-6 text-slate-400">
            The user you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="rounded-lg bg-primary-light px-6 py-3 text-primary-fg-light transition hover:opacity-90 dark:bg-primary-dark dark:text-primary-fg-dark"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const winPercentage =
    profile.totalGames > 0 ? (profile.wins / profile.totalGames) * 100 : 0;
  const drawPercentage =
    profile.totalGames > 0 ? (profile.draws / profile.totalGames) * 100 : 0;
  const lossPercentage =
    profile.totalGames > 0 ? (profile.losses / profile.totalGames) * 100 : 0;

  return (
    <div className="mt-10 min-h-[calc(100vh-80px)] px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <div className="mb-6 rounded-2xl border border-border-light bg-card-light p-8 backdrop-blur-sm dark:border-border-dark dark:bg-card-dark">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="h-32 w-32 rounded-full border-4 border-border-light object-cover dark:border-border-dark"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-secondary-light dark:bg-secondary-dark">
                  <User className="h-16 w-16 text-muted-fg-light dark:text-muted-fg-dark" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="mb-2 text-4xl font-bold text-fg-light dark:text-fg-dark">
                {profile.username}
              </h1>
              <p className="mb-3 text-muted-fg-light dark:text-muted-fg-dark">
                {profile.email}
              </p>
              {profile.bio && (
                <p className="mb-4 max-w-2xl text-fg-light dark:text-fg-dark">
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-primary-fg-light transition hover:opacity-90 dark:bg-primary-dark dark:text-primary-fg-dark"
                  >
                    <Edit className="h-4 w-4" />
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
        <div className="mb-6 rounded-2xl border border-border-light bg-card-light p-8 backdrop-blur-sm dark:border-border-dark dark:bg-card-dark">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-fg-light dark:text-fg-dark">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Statistics
          </h2>

          <div className="mb-8 grid grid-cols-2 md:grid-cols-4">
            {/* Rating */}
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">{profile.rating}</div>
              <div className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
                Rating
              </div>
            </div>

            {/* Total Games */}
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-fg-light dark:text-fg-dark">
                {profile.totalGames}
              </div>
              <div className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
                Total Games
              </div>
            </div>

            {/* Win Rate */}
            <div className="text-center">
              <div
                className={`mb-2 text-5xl font-bold ${profile.winRate > 50 ? "text-success" : "text-destructive"}`}
              >
                {profile.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
                Win Rate
              </div>
            </div>

            {/* Record */}
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-fg-light dark:text-fg-dark">
                {profile.wins}-{profile.losses}-{profile.draws}
              </div>
              <div className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
                W-L-D
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Current Streak */}
            <div className="rounded-lg bg-secondary-light p-4 dark:bg-secondary-dark">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-fg-light dark:text-muted-fg-dark">
                  Current Streak
                </span>
                {profile.currentStreak > 3 && (
                  <Flame className="h-5 w-5 text-orange-500" />
                )}
              </div>
              <div className="text-3xl font-bold text-secondary-fg-light dark:text-secondary-fg-dark">
                {profile.currentStreak}
              </div>
            </div>

            {/* Longest Streak */}
            <div className="rounded-lg bg-secondary-light p-4 dark:bg-secondary-dark">
              <div className="mb-2 text-sm text-muted-fg-light dark:text-muted-fg-dark">
                Longest Streak
              </div>
              <div className="text-3xl font-bold text-secondary-fg-light dark:text-secondary-fg-dark">
                {profile.longestStreak}
              </div>
            </div>

            {/* Last Game */}
            <div className="rounded-lg bg-secondary-light p-4 dark:bg-secondary-dark">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-fg-light dark:text-muted-fg-dark">
                <Calendar className="h-4 w-4" />
                Last Game
              </div>
              <div className="text-lg font-semibold text-secondary-fg-light dark:text-secondary-fg-dark">
                {getRelativeTime(profile.lastGameAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mb-6 rounded-2xl border border-border-light bg-card-light p-8 backdrop-blur-sm dark:border-border-dark dark:bg-card-dark">
          <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-fg-light dark:text-fg-dark">
            <TrendingUp className="h-5 w-5 text-primary-light dark:text-primary-dark" />
            Performance Breakdown
          </h3>
          <div className="space-y-4">
            {/* Wins Bar */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-success">Wins</span>
                <span className="text-muted-fg-light dark:text-muted-fg-dark">
                  {profile.wins} ({winPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted-light dark:bg-muted-dark">
                <div
                  className="h-full bg-gradient-to-r from-success to-success/70 transition-all duration-500"
                  style={{ width: `${winPercentage}%` }}
                />
              </div>
            </div>

            {/* Draws Bar */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-yellow-400">Draws</span>
                <span className="text-muted-fg-light dark:text-muted-fg-dark">
                  {profile.draws} ({drawPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted-light dark:bg-muted-dark">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500"
                  style={{ width: `${drawPercentage}%` }}
                />
              </div>
            </div>

            {/* Losses Bar */}
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-destructive">Losses</span>
                <span className="text-muted-fg-light dark:text-muted-fg-dark">
                  {profile.losses} ({lossPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted-light dark:bg-muted-dark">
                <div
                  className="h-full bg-gradient-to-r from-destructive to-destructive/70 transition-all duration-500"
                  style={{ width: `${lossPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="rounded-2xl border border-border-light bg-card-light p-8 backdrop-blur-sm dark:border-border-dark dark:bg-card-dark">
          <h3 className="mb-4 text-xl font-bold text-fg-light dark:text-fg-dark">
            Recent Activity
          </h3>
          <div className="py-12 text-center">
            <p className="text-muted-fg-light dark:text-muted-fg-dark">
              Recent games will appear here
            </p>
            <p className="mt-2 text-sm text-muted-fg-light dark:text-muted-fg-dark">
              Coming soon in Step 8
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
