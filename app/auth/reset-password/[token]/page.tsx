"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import toast from "react-hot-toast";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    password: "",
    confirmPassword: "",
  });

  const isFormEmpty = !data.password || !data.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          newPassword: data.password,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully! Redirecting...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        toast.error(responseData.message || "Reset failed");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border-light bg-card-light p-10 shadow-md dark:border-border-dark dark:bg-card-dark">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-fg-light dark:text-fg-dark">
            Reset Password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-t-md border border-border-light bg-secondary-light px-3 py-2 text-fg-light placeholder-muted-fg-light focus:z-10 focus:border-primary-light focus:ring-primary-light focus:outline-none sm:text-sm dark:border-border-dark dark:bg-secondary-dark dark:text-fg-dark dark:placeholder-muted-fg-dark dark:focus:border-primary-dark dark:focus:ring-primary-dark"
                placeholder="New Password"
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
                className="relative block w-full appearance-none rounded-b-md border border-border-light bg-secondary-light px-3 py-2 text-fg-light placeholder-muted-fg-light focus:z-10 focus:border-primary-light focus:ring-primary-light focus:outline-none sm:text-sm dark:border-border-dark dark:bg-secondary-dark dark:text-fg-dark dark:placeholder-muted-fg-dark dark:focus:border-primary-dark dark:focus:ring-primary-dark"
                placeholder="Confirm Password"
                value={data.confirmPassword}
                onChange={(e) =>
                  setData({ ...data, confirmPassword: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isFormEmpty}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-light px-4 py-2 text-sm font-medium text-primary-fg-light hover:opacity-90 focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-dark dark:text-primary-fg-dark dark:focus:ring-primary-dark"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
