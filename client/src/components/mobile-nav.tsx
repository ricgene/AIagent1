import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu } from "lucide-react";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 block md:hidden" 
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          <Link href="/" className="font-medium">
            Home
          </Link>
          <Link href="/search" className="font-medium">
            Find Businesses
          </Link>
          <Link href="/business/profile" className="font-medium">
            Business Profile
          </Link>
          <Link href="/messages" className="font-medium">
            Messages
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}