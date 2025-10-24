"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  LogOut,
  User,
  Settings,
  Shield,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface TopMenuProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function TopMenu({ onMenuToggle, isSidebarOpen }: TopMenuProps) {
  const { session, logout } = useAuth();
  const { checkRole } = usePermission();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isAdmin = checkRole("admin");
  const isModerator = checkRole("moderator");

  const handleLogout = async () => {
    await logout();
  };

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        {/* Left Section - Menu Toggle */}
        <div className="flex items-center gap-2">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="lg:hidden"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>

        {/* Center Section - Logo (on mobile) */}
        <div className="flex-1 flex justify-center lg:justify-start">
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            Dandindun
          </Link>
        </div>

        {/* Right Section - Controls and Profile */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Profile Dropdown */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email}`}
                    alt={session?.user?.name}
                  />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* User Info */}
              <DropdownMenuLabel className="flex flex-col space-y-1">
                <p className="font-semibold">{session?.user?.name}</p>
                <p className="text-xs text-foreground/60">
                  {session?.user?.email}
                </p>
              </DropdownMenuLabel>

              {/* Role Badge */}
              <div className="px-2 py-1.5">
                <Badge variant="default" className="w-full justify-center">
                  {session?.user?.role.toUpperCase()}
                </Badge>
              </div>

              {/* Admin Badge if applicable */}
              {(isAdmin || isModerator) && (
                <div className="px-2 py-1.5">
                  <Badge
                    variant="secondary"
                    className="w-full justify-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    {isAdmin ? "Administrator" : "Moderator"}
                  </Badge>
                </div>
              )}

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold">
                    Admin Tools
                  </DropdownMenuLabel>

                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
