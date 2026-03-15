"use client";

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: string;
  className?: string;
  isMe?: boolean;
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "h-8 w-8",
  className = "",
  isMe = false,
}: UserAvatarProps) {
  const getInitial = () => {
    if (name) return name.charAt(0).toUpperCase();
    return "?";
  };

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full border shrink-0 ${size} ${
        isMe
          ? "border-primary-light bg-primary-light/10 dark:border-primary-dark dark:bg-primary-dark/10"
          : "border-border-light bg-muted-light dark:border-border-dark dark:bg-muted-dark"
      } ${className}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name || "User avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className={`font-bold ${
            size.includes("h-8") ? "text-xs" : 
            size.includes("h-10") ? "text-sm" : 
            "text-base"
          } ${
            isMe
              ? "text-primary-light dark:text-primary-dark"
              : "text-muted-fg-light dark:text-muted-fg-dark"
          }`}
        >
          {getInitial()}
        </span>
      )}
    </div>
  );
}
