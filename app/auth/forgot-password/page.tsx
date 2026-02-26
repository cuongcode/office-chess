"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSuccess(true);
                toast.success("Reset link sent!");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error("Forgot password error:", error);
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
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-fg-light dark:text-muted-fg-dark">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                {success ? (
                    <div className="rounded-md bg-success-light/10 dark:bg-success-light/20 p-4 border border-success-light/20">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                {/* Heroicon name: mini/check-circle */}
                                <svg className="h-5 w-5 text-success-light" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-success-light">
                                    Check your email for the reset link.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link href="/auth/login" className="text-sm font-medium text-success-light hover:opacity-80">
                                Back to login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                                    className="relative block w-full appearance-none rounded-md border border-border-light dark:border-border-dark px-3 py-2 text-fg-light dark:text-fg-dark placeholder-muted-fg-light dark:placeholder-muted-fg-dark focus:z-10 focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link
                                    href="/auth/login"
                                    className="font-medium text-primary-light dark:text-primary-dark hover:text-primary-light/80 dark:hover:text-primary-dark/80"
                                >
                                    Back to login
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-light dark:bg-primary-dark py-2 px-4 text-sm font-medium text-primary-fg-light dark:text-primary-fg-dark hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 disabled:opacity-70"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
