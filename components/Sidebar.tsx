"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Users,
  Shield,
  Lock,
  Clock,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
} from "lucide-react";
import { useState } from "react";

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  permission?: string;
  badge?: string | number;
  submenu?: MenuItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const { check, checkRole } = usePermission();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubmenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isAdmin = checkRole("admin");
  const isModerator = checkRole("moderator");

  // Build menu items based on permissions
  const menuItems: MenuItem[] = [
    {
      title: "Home",
      icon: <Home className="w-5 h-5" />,
      href: "/",
      permission: "view_dashboard",
    },
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/dashboard",
      permission: "view_dashboard",
    },
    ...(isAdmin || isModerator
      ? [
          {
            title: "Admin Panel",
            icon: <Shield className="w-5 h-5" />,
            href: "/admin",
            permission: "manage_users",
            badge: "Admin" as const,
            submenu: [
              {
                title: "Users",
                icon: <Users className="w-4 h-4" />,
                href: "/admin/users",
                permission: "manage_users",
              },
              {
                title: "Roles",
                icon: <Shield className="w-4 h-4" />,
                href: "/admin/roles",
                permission: "manage_roles",
              },
              {
                title: "Permissions",
                icon: <Lock className="w-4 h-4" />,
                href: "/admin/permissions",
                permission: "manage_permissions",
              },
              {
                title: "Sessions",
                icon: <Clock className="w-4 h-4" />,
                href: "/admin/sessions",
                permission: "manage_users",
              },
              {
                title: "Languages",
                icon: <Globe className="w-4 h-4" />,
                href: "/admin/languages",
                permission: "manage_settings",
              },
              {
                title: "Settings",
                icon: <Settings className="w-4 h-4" />,
                href: "/admin/settings",
                permission: "manage_settings",
              },
            ] as MenuItem[],
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/en" || pathname === "/id";
    }
    return pathname.includes(href);
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Logo Section */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
            D
          </div>
          <span className="hidden sm:inline">Dandindun</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const isExpanded = expandedMenus.includes(item.title);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const active = isActive(item.href);

          return (
            <div key={item.title}>
              <div className="flex items-center gap-2">
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "flex-1 flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex-1 flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.title}</span>
                  </Link>
                )}
                {item.badge && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Submenu */}
              {hasSubmenu && isExpanded && (
                <div className="ml-2 mt-2 space-y-1 border-l border-muted">
                  {item.submenu?.map((subitem) => (
                    <Link
                      key={subitem.title}
                      href={subitem.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-xs font-medium ml-2",
                        isActive(subitem.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/60 hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {subitem.icon}
                      <span>{subitem.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-foreground/60">Active</span>
        </div>

        <div className="text-xs">
          <p className="font-semibold text-foreground truncate">
            {session?.user?.name || "User"}
          </p>
          <p className="text-foreground/60 truncate">{session?.user?.email}</p>
          <p className="text-foreground/50 mt-1 capitalize">
            {session?.user?.role}
          </p>
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
