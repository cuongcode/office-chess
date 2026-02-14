"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/auth/verify-email?token=${resolvedParams.token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage("Email verified successfully! Redirecting to login...");
                    toast.success("Email verified!");
                    setTimeout(() => {
                        router.push("/auth/login");
                    }, 3000);
                } else {
                    setStatus("error");
                    setMessage(data.message || "Invalid or expired token");
                    toast.error(data.message || "Verification failed");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                setMessage("Something went wrong");
                toast.error("Something went wrong");
            }
        };

        verifyEmail();
    }, [resolvedParams.token, router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Email Verification
                </h2>

                {status === "loading" && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {status === "success" && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">{message}</p>
                    </div>
                )}

                {status === "error" && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">{message}</p>
                        <div className="mt-4">
                            <Link href="/auth/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                Back to login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
