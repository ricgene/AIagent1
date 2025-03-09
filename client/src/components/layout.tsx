import { Link } from "wouter";
import { MobileNav } from "./mobile-nav";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-primary">
      <header className="sticky top-0 z-50 w-full border-b bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/60">
        <div className="container flex h-14 items-center">
          <MobileNav />
        </div>
      </header>
      <main className="container py-6 text-primary-foreground">{children}</main>
    </div>
  );
}