import { Shield, LayoutDashboard, LogOut, User, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfig } from "@/hooks/use-config";

export function Header() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { data: config } = useConfig();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link href="/" data-testid="link-home-logo">
            <div className="flex items-center gap-2 cursor-pointer">
              {config?.branding?.logoUrl && (
                <img 
                  src={config.branding.logoUrl} 
                  alt={config.appName} 
                  className="h-9 w-auto dark:hidden"
                />
              )}
              {config?.branding?.logoDarkUrl && (
                <img 
                  src={config.branding.logoDarkUrl} 
                  alt={config.appName} 
                  className="h-9 w-auto hidden dark:block"
                />
              )}
              {(!config?.branding?.logoUrl && !config?.branding?.logoDarkUrl) && (
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <span className="text-lg font-semibold">{config?.appName || 'Domain Verify'}</span>
            </div>
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              <Button 
                variant={location === "/dashboard" ? "secondary" : "ghost"} 
                size="sm"
                data-testid="link-dashboard"
                asChild
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover-elevate"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline" data-testid="text-user-name">
                    {user.firstName} {user.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild data-testid="menu-item-profile">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild data-testid="menu-item-settings">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  data-testid="menu-item-logout"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
