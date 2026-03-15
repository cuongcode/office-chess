"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";

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
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, playerData]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border border-border-light bg-card-light p-4 dark:border-border-dark dark:bg-card-dark">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted-light dark:bg-muted-dark" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-24 rounded bg-muted-light dark:bg-muted-dark" />
            <div className="h-3 w-16 rounded bg-muted-light dark:bg-muted-dark" />
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
      className="block cursor-pointer rounded-lg border border-border-light bg-card-light p-4 transition-all hover:border-primary-light hover:shadow-lg hover:shadow-primary-light/20 dark:border-border-dark dark:bg-card-dark dark:hover:border-primary-dark"
    >
      <div className="flex items-center gap-3">
        <UserAvatar
          name={profile.username}
          avatarUrl={profile.avatar}
          size="h-12 w-12"
          className="border-2 border-primary-light dark:border-primary-dark"
        />

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-card-fg-light dark:text-card-fg-dark">
            {profile.username}
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-yellow-500">
              <Trophy className="h-3 w-3" />
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
