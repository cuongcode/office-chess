"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const registerUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password
                }),
            });

            const responseData = await response.json();

            if (response.ok) {
                toast.success("Verification email sent! Check your inbox.");
                router.push("/auth/login");
            } else {
                toast.error(responseData.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-fg-light dark:text-muted-fg-dark">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="font-medium text-primary-light dark:text-primary-dark hover:text-primary-light/80 dark:hover:text-primary-dark/80"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={registerUser}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="name" className="sr-only">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="relative block w-full appearance-none rounded-t-md border border-border-light dark:border-border-dark bg-secondary-light dark:bg-secondary-dark px-3 py-2 text-fg-light dark:text-fg-dark placeholder-muted-fg-light dark:placeholder-muted-fg-dark focus:z-10 focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                                placeholder="Name"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                            />
                        </div>
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
                                className="relative block w-full appearance-none border border-border-light dark:border-border-dark bg-secondary-light dark:bg-secondary-dark px-3 py-2 text-fg-light dark:text-fg-dark placeholder-muted-fg-light dark:placeholder-muted-fg-dark focus:z-10 focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                                placeholder="Email address (must be @test.com)"
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
                                required
                                className="relative block w-full appearance-none border border-border-light dark:border-border-dark bg-secondary-light dark:bg-secondary-dark px-3 py-2 text-fg-light dark:text-fg-dark placeholder-muted-fg-light dark:placeholder-muted-fg-dark focus:z-10 focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="relative block w-full appearance-none rounded-b-md border border-border-light dark:border-border-dark bg-secondary-light dark:bg-secondary-dark px-3 py-2 text-fg-light dark:text-fg-dark placeholder-muted-fg-light dark:placeholder-muted-fg-dark focus:z-10 focus:border-primary-light dark:focus:border-primary-dark focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                                placeholder="Confirm Password"
                                value={data.confirmPassword}
                                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
