import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full text-center text-sm text-muted-fg-light dark:text-muted-fg-dark">
      Developed by{" "}
      <Link
        href="#"
        className="font-medium text-primary-light hover:text-primary-light/80 dark:text-primary-dark dark:hover:text-primary-dark/80"
      >
        One
      </Link>
    </footer>
  );
}
