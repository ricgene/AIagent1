import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <nav className="container flex h-14 items-center gap-4 md:gap-8">
          <Link href="/" className="font-medium">
            Home
          </Link>
          <Link href="/messages" className="font-medium">
            Messages
          </Link>
        </nav>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}