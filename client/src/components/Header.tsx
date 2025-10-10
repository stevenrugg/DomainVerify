import { Shield, LayoutDashboard, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { user } = useAuth();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="flex items-center gap-2" data-testid="link-home-logo">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">DomainVerify</span>
            </a>
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button 
                  variant={location === "/" ? "secondary" : "ghost"} 
                  size="sm"
                  data-testid="link-home"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  variant={location === "/dashboard" ? "secondary" : "ghost"} 
                  size="sm"
                  data-testid="link-dashboard"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2" data-testid="user-info">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline" data-testid="text-user-name">
                {user.firstName} {user.lastName}
              </span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
