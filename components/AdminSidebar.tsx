"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  BarChart3,
  Users,
  Shield,
  Lock,
  Clock,
  Globe,
  Settings,
  LogOut,
} from "lucide-react";

interface AdminMenuItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  permission?: string;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const { check } = usePermission();

  // Admin menu items
  const menuItems: AdminMenuItem[] = [
    {
      title: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/admin",
      permission: "manage_users",
    },
    {
      title: "Users",
      icon: <Users className="w-5 h-5" />,
      href: "/admin/users",
      permission: "manage_users",
    },
    {
      title: "Roles",
      icon: <Shield className="w-5 h-5" />,
      href: "/admin/roles",
      permission: "manage_roles",
    },
    {
      title: "Permissions",
      icon: <Lock className="w-5 h-5" />,
      href: "/admin/permissions",
      permission: "manage_permissions",
    },
    {
      title: "Sessions",
      icon: <Clock className="w-5 h-5" />,
      href: "/admin/sessions",
      permission: "manage_users",
    },
    {
      title: "Languages",
      icon: <Globe className="w-5 h-5" />,
      href: "/admin/languages",
      permission: "manage_settings",
    },
    {
      title: "Settings",
      icon: <Settings className="w-5 h-5" />,
      href: "/admin/settings",
      permission: "manage_settings",
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    return pathname.includes(href);
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Logo Section */}
      <div className="p-4 border-b">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <span className="hidden sm:inline">Admin</span>
        </Link>
        <p className="text-xs text-foreground/50 mt-1">Control Panel</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                active
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}
            >
              <div className={cn(
                active ? "text-red-700 dark:text-red-200" : "text-foreground/60"
              )}>
                {item.icon}
              </div>
              <span className="flex-1">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Info Section */}
      <div className="border-t p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-xs text-foreground/60">Admin Mode</span>
        </div>

        <div className="text-xs">
          <p className="font-semibold text-foreground truncate">
            {session?.user?.name || "Admin User"}
          </p>
          <p className="text-foreground/60 truncate">{session?.user?.email}</p>
          <div className="mt-1.5 inline-flex">
            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded font-semibold">
              {session?.user?.role.toUpperCase()}
            </span>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-2 text-foreground/70 hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
