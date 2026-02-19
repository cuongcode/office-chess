"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        email: "",
        password: "",
    });

    const loginUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Check if passwords are valid or not
        if (!data.email || !data.password) {
            toast.error("Please enter both email and password");
            setLoading(false);
            return;
        }

        try {
            const callback = await signIn("credentials", {
                ...data,
                redirect: false,
            });

            if (callback?.error) {
                toast.error(callback.error);
            }

            if (callback?.ok && !callback?.error) {
                toast.success("Logged in successfully!");
                router.push("/");
                // Force a refresh to update session state if needed, though router.push usually suffices with NextAuth
                router.refresh();
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-card-light dark:bg-card-dark p-10 shadow-md border border-border-light dark:border-border-dark">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-fg-light dark:text-fg-dark">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-fg-light dark:text-muted-fg-dark">
                        Or{" "}
                        <Link
                            href="/auth/register"
                            className="font-medium text-primary-light dark:text-primary-dark hover:text-primary-light/80 dark:hover:text-primary-dark/80"
                        >
                            start for free today
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={loginUser}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full appearance-none rounded-t-md border border-border-light dark:border-border-dark bg-secondary-light dark:bg-secondary-dark px-3 py-2 text-fg-light dark:text-fg-dark placeholder-muted-fg-light dark:placeholder-muted-fg-dark focus:z-10 focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                                placeholder="Email address"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full appearance-none rounded-b-md border border-border-light dark:border-border-dark bg-secondary-light dark:bg-secondary-dark px-3 py-2 text-fg-light dark:text-fg-dark placeholder-muted-fg-light dark:placeholder-muted-fg-dark focus:z-10 focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-border-light dark:border-border-dark text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-fg-light dark:text-fg-dark"
                            >
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                href="/auth/forgot-password"
                                className="font-medium text-primary-light dark:text-primary-dark hover:text-primary-light/80 dark:hover:text-primary-dark/80"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
