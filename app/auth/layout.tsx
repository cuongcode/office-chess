import { Footer } from "@/components";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col justify-between">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
