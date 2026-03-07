"use client";

import { Check, Loader2, Upload, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [originalUsername, setOriginalUsername] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.email) {
      // Fetch current user profile
      const fetchProfile = async () => {
        try {
          const userResponse = await fetch("/api/auth/session");
          const userData = await userResponse.json();

          // Get user ID from session
          const response = await fetch(`/api/profile/${userData.user.id}`);
          if (response.ok) {
            const profile = await response.json();
            setFormData({
              username: profile.username || "",
              bio: profile.bio || "",
              avatar: profile.avatar || "",
            });
            setOriginalUsername(profile.username || "");
            setAvatarPreview(profile.avatar);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };

      fetchProfile();
    }
  }, [session, status, router]);

  // Debounced username availability check
  useEffect(() => {
    if (!formData.username || formData.username === originalUsername) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const response = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(formData.username)}`,
        );
        const data = await response.json();
        setUsernameAvailable(data.available);
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, originalUsername]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed",
      );
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleAvatarChange(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    if (formData.username && formData.username !== originalUsername) {
      if (formData.username.length < 3 || formData.username.length > 20) {
        toast.error("Username must be between 3 and 20 characters");
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        toast.error(
          "Username can only contain letters, numbers, and underscores",
        );
        return;
      }

      if (!usernameAvailable) {
        toast.error("Username is not available");
        return;
      }
    }

    // Validate bio
    if (formData.bio && formData.bio.length > 200) {
      toast.error("Bio must be 200 characters or less");
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = formData.avatar;

      // Upload avatar if changed
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);

        const avatarResponse = await fetch("/api/profile/avatar", {
          method: "POST",
          body: avatarFormData,
        });

        if (!avatarResponse.ok) {
          throw new Error("Failed to upload avatar");
        }

        const avatarData = await avatarResponse.json();
        avatarUrl = avatarData.avatarUrl;
      }

      // Update profile
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username || undefined,
          bio: formData.bio || undefined,
          avatar: avatarUrl || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const data = await response.json();
      toast.success("Profile updated successfully!");

      // Redirect to profile page
      router.push(`/profile/${data.profile.id}`);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  const bioCharCount = formData.bio.length;
  const bioCharLimit = 200;

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-12 pt-28">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border-light bg-card-light p-8 backdrop-blur-sm dark:border-border-dark dark:bg-card-dark">
        <h1 className="mb-6 text-3xl font-bold text-fg-light dark:text-fg-dark">
          Edit Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark">
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              {/* Current Avatar */}
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-24 w-24 rounded-full border-4 border-primary-light object-cover dark:border-primary-dark"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary-light dark:bg-secondary-dark">
                    <User className="h-12 w-12 text-muted-fg-light dark:text-muted-fg-dark" />
                  </div>
                )}
              </div>

              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex-1 cursor-pointer rounded-lg border-2 border-dashed border-border-light p-6 text-center hover:border-primary-light dark:border-border-dark dark:hover:border-primary-dark"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-fg-light dark:text-muted-fg-dark" />
                <p className="mb-1 text-sm text-muted-fg-light dark:text-muted-fg-dark">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
                  JPG, PNG, GIF or WebP (max 2MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark"
            >
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full rounded-lg border border-border-light bg-secondary-light px-4 py-3 text-fg-light placeholder-muted-fg-light focus:border-transparent focus:ring-2 focus:ring-primary-light focus:outline-none dark:border-border-dark dark:bg-secondary-dark dark:text-fg-dark dark:placeholder-muted-fg-dark dark:focus:ring-primary-dark"
                placeholder="Enter username"
              />
              {checkingUsername && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              )}
              {!checkingUsername &&
                usernameAvailable !== null &&
                formData.username !== originalUsername && (
                  <div className="absolute top-1/2 right-3 -translate-y-1/2">
                    {usernameAvailable ? (
                      <Check className="h-5 w-5 text-success" />
                    ) : (
                      <X className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                )}
            </div>
            <p className="mt-1 text-xs text-muted-fg-light dark:text-muted-fg-dark">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="mb-2 block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark"
            >
              Bio
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              maxLength={200}
              className="w-full resize-none rounded-lg border border-border-light bg-secondary-light px-4 py-3 text-fg-light placeholder-muted-fg-light focus:border-transparent focus:ring-2 focus:ring-primary-light focus:outline-none dark:border-border-dark dark:bg-secondary-dark dark:text-fg-dark dark:placeholder-muted-fg-dark dark:focus:ring-primary-dark"
              placeholder="Tell us about yourself..."
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-muted-fg-light dark:text-muted-fg-dark">
                Short description for your profile
              </p>
              <p
                className={`text-xs ${bioCharCount > bioCharLimit ? "text-destructive" : "text-muted-fg-light dark:text-muted-fg-dark"}`}
              >
                {bioCharCount}/{bioCharLimit}
              </p>
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-border-light bg-secondary-light/50 px-4 py-3 text-muted-fg-light dark:border-border-dark dark:bg-secondary-dark/50 dark:text-muted-fg-dark"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={
                loading ||
                (formData.username !== originalUsername && !usernameAvailable)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-light px-6 py-3 text-primary-fg-light hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-dark dark:text-primary-fg-dark"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="rounded-lg !border-0 bg-secondary-light px-6 py-3 text-secondary-fg-light hover:bg-secondary-light/80 dark:bg-secondary-dark dark:text-secondary-fg-dark dark:hover:bg-secondary-dark/80"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
