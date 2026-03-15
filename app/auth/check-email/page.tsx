import Link from "next/link";
import { Mail } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border-light bg-card-light p-10 shadow-md dark:border-border-dark dark:bg-card-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light/10 dark:bg-primary-dark/10">
            <Mail
              className="h-10 w-10 text-primary-light dark:text-primary-dark"
              strokeWidth={1.5}
            />
          </div>

          <h2 className="text-center text-3xl font-extrabold text-fg-light dark:text-fg-dark">
            Check your email
          </h2>

          <p className="text-center text-sm text-muted-fg-light dark:text-muted-fg-dark">
            We&apos;ve sent a verification link to your email address. Please
            open it to activate your account before signing in.
          </p>

          <p className="text-center text-xs text-muted-fg-light dark:text-muted-fg-dark">
            Didn&apos;t receive an email? Check your spam folder or{" "}
            <Link
              href="/auth/register"
              className="font-medium text-primary-light hover:text-primary-light/80 dark:text-primary-dark dark:hover:text-primary-dark/80"
            >
              try registering again
            </Link>
            .
          </p>
        </div>

        <div className="border-t border-border-light pt-6 dark:border-border-dark">
          <p className="text-center text-sm text-muted-fg-light dark:text-muted-fg-dark">
            Already verified?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary-light hover:text-primary-light/80 dark:text-primary-dark dark:hover:text-primary-dark/80"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
