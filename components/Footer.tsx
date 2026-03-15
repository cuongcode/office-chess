import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full text-center text-sm text-muted-fg-light dark:text-muted-fg-dark">
      Developed by{" "}
      <Link
        href="#"
        className="font-medium text-fg-light hover:text-primary-light/80 dark:text-fg-dark dark:hover:text-primary-dark/80"
      >
        One
      </Link>
    </footer>
  );
}
