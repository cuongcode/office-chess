'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Upload, X, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/Button";

export default function EditProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        avatar: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [originalUsername, setOriginalUsername] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (session?.user?.email) {
            // Fetch current user profile
            const fetchProfile = async () => {
                try {
                    const userResponse = await fetch('/api/auth/session');
                    const userData = await userResponse.json();

                    // Get user ID from session
                    const response = await fetch(`/api/profile/${userData.user.id}`);
                    if (response.ok) {
                        const profile = await response.json();
                        setFormData({
                            username: profile.username || '',
                            bio: profile.bio || '',
                            avatar: profile.avatar || '',
                        });
                        setOriginalUsername(profile.username || '');
                        setAvatarPreview(profile.avatar);
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
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
                const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(formData.username)}`);
                const data = await response.json();
                setUsernameAvailable(data.available);
            } catch (error) {
                console.error('Error checking username:', error);
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
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed');
            return;
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size must be less than 2MB');
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
                target: { files: [file] }
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
                toast.error('Username must be between 3 and 20 characters');
                return;
            }

            if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                toast.error('Username can only contain letters, numbers, and underscores');
                return;
            }

            if (!usernameAvailable) {
                toast.error('Username is not available');
                return;
            }
        }

        // Validate bio
        if (formData.bio && formData.bio.length > 200) {
            toast.error('Bio must be 200 characters or less');
            return;
        }

        setLoading(true);

        try {
            let avatarUrl = formData.avatar;

            // Upload avatar if changed
            if (avatarFile) {
                const avatarFormData = new FormData();
                avatarFormData.append('avatar', avatarFile);

                const avatarResponse = await fetch('/api/profile/avatar', {
                    method: 'POST',
                    body: avatarFormData,
                });

                if (!avatarResponse.ok) {
                    throw new Error('Failed to upload avatar');
                }

                const avatarData = await avatarResponse.json();
                avatarUrl = avatarData.avatarUrl;
            }

            // Update profile
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username || undefined,
                    bio: formData.bio || undefined,
                    avatar: avatarUrl || undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update profile');
            }

            const data = await response.json();
            toast.success('Profile updated successfully!');

            // Redirect to profile page
            router.push(`/profile/${data.profile.id}`);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    const bioCharCount = formData.bio.length;
    const bioCharLimit = 200;

    return (
        <div className="min-h-[calc(100vh-80px)] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card-light dark:bg-card-dark backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-border-light dark:border-border-dark">
                    <h1 className="text-3xl font-bold text-fg-light dark:text-fg-dark mb-6">Edit Profile</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div>
                            <label className="block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark mb-2">
                                Profile Picture
                            </label>
                            <div className="flex items-center gap-6">
                                {/* Current Avatar */}
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            className="w-24 h-24 rounded-full border-4 border-primary-light dark:border-primary-dark object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full border-4 border-primary-light dark:border-primary-dark bg-gradient-to-br from-primary-light to-purple-600 flex items-center justify-center">
                                            <User className="w-12 h-12 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Upload Area */}
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    className="flex-1 border-2 border-dashed border-border-light dark:border-border-dark rounded-lg p-6 text-center hover:border-primary-light dark:hover:border-primary-dark transition cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-8 h-8 text-muted-fg-light dark:text-muted-fg-dark mx-auto mb-2" />
                                    <p className="text-muted-fg-light dark:text-muted-fg-dark text-sm mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-muted-fg-light dark:text-muted-fg-dark text-xs">
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
                            <label htmlFor="username" className="block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-3 bg-secondary-light dark:bg-secondary-dark border border-border-light dark:border-border-dark rounded-lg text-fg-light dark:text-fg-dark placeholder-muted-fg-light dark:placeholder-muted-fg-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent"
                                    placeholder="Enter username"
                                />
                                {checkingUsername && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                                    </div>
                                )}
                                {!checkingUsername && usernameAvailable !== null && formData.username !== originalUsername && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {usernameAvailable ? (
                                            <Check className="w-5 h-5 text-success" />
                                        ) : (
                                            <X className="w-5 h-5 text-destructive" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-muted-fg-light dark:text-muted-fg-dark text-xs mt-1">
                                3-20 characters, letters, numbers, and underscores only
                            </p>
                        </div>

                        {/* Bio */}
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark mb-2">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                maxLength={200}
                                className="w-full px-4 py-3 bg-secondary-light dark:bg-secondary-dark border border-border-light dark:border-border-dark rounded-lg text-fg-light dark:text-fg-dark placeholder-muted-fg-light dark:placeholder-muted-fg-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent resize-none"
                                placeholder="Tell us about yourself..."
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-muted-fg-light dark:text-muted-fg-dark text-xs">Short description for your profile</p>
                                <p className={`text-xs ${bioCharCount > bioCharLimit ? 'text-destructive' : 'text-muted-fg-light dark:text-muted-fg-dark'}`}>
                                    {bioCharCount}/{bioCharLimit}
                                </p>
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-muted-fg-light dark:text-muted-fg-dark mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={session?.user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-secondary-light/50 dark:bg-secondary-dark/50 border border-border-light dark:border-border-dark rounded-lg text-muted-fg-light dark:text-muted-fg-dark cursor-not-allowed"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={loading || (formData.username !== originalUsername && !usernameAvailable)}
                                className="flex-1 px-6 py-3 bg-primary-light dark:bg-primary-dark text-primary-fg-light dark:text-primary-fg-dark rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => router.back()}
                                className="px-6 py-3 bg-secondary-light dark:bg-secondary-dark text-secondary-fg-light dark:text-secondary-fg-dark rounded-lg hover:bg-secondary-light/80 dark:hover:bg-secondary-dark/80 transition !border-0"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
