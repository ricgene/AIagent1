import { Link } from "wouter";
import { MobileNav } from "./mobile-nav";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">AIConnect</span>
          </Link>
          <MobileNav />
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}
