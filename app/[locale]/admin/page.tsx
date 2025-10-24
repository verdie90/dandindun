"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { AdminLayout } from "@/components/AdminLayout";
import { getAllUsers } from "@/lib/user-service";
import { getAllRoles } from "@/lib/role-permission-service";
import { getAllActiveSessions } from "@/lib/session-service";
import { getAppSettings } from "@/lib/settings-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import {
  Users,
  Shield,
  Lock,
  Clock,
  Globe,
  Settings,
  BarChart3,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  activeSessions: number;
  maintenanceMode: boolean;
}

function AdminDashboardContent() {
  const router = useRouter();
  const { session } = useAuth();
  const { checkRole } = usePermission();

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRoles: 0,
    activeSessions: 0,
    maintenanceMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const adminModules = [
    {
      title: "User Management",
      description: "Manage user accounts and roles",
      href: "/admin/users",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      permission: "manage_users",
    },
    {
      title: "Roles",
      description: "Create and manage roles",
      href: "/admin/roles",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      permission: "manage_roles",
    },
    {
      title: "Permissions",
      description: "Configure system permissions",
      href: "/admin/permissions",
      icon: Lock,
      color: "text-red-600",
      bgColor: "bg-red-100",
      permission: "manage_permissions",
    },
    {
      title: "Sessions",
      description: "Monitor active sessions",
      href: "/admin/sessions",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      permission: "manage_sessions",
    },
    {
      title: "Languages",
      description: "Manage languages",
      href: "/admin/languages",
      icon: Globe,
      color: "text-green-600",
      bgColor: "bg-green-100",
      permission: "manage_settings",
    },
    {
      title: "Settings",
      description: "Configure application",
      href: "/admin/settings",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      permission: "manage_settings",
    },
  ];

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, roles, sessions] = await Promise.all([
          getAllUsers(),
          getAllRoles(),
          getAllActiveSessions(),
        ]);

        let maintenanceMode = false;
        try {
          const settings = await getAppSettings();
          maintenanceMode = settings?.maintenanceMode || false;
        } catch (err) {
          // Settings might not exist yet
        }

        setStats({
          totalUsers: users.length,
          totalRoles: roles.length,
          activeSessions: sessions.length,
          maintenanceMode,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session.isAuthenticated) {
      loadStats();
    }
  }, [session.isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your application and system configuration
          </p>
        </div>

        {/* Maintenance Alert */}
        {stats.maintenanceMode && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">Maintenance Mode Active</p>
              <p className="text-sm text-yellow-700">
                Only administrators can access the application
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Roles</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalRoles}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold mt-1">{stats.activeSessions}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {stats.maintenanceMode ? (
                      <Badge variant="destructive">Maintenance</Badge>
                    ) : (
                      <Badge variant="default">Operational</Badge>
                    )}
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Modules */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Management Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminModules.map((module) => {
              const Icon = module.icon;
              const userHasPermission =
                session.user?.role === "admin" ||
                (session.user?.role &&
                  module.permission === "manage_settings");

              return (
                <Link key={module.href} href={module.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {module.title}
                          </CardTitle>
                          <CardDescription>
                            {module.description}
                          </CardDescription>
                        </div>
                        <div className={`p-3 rounded-lg ${module.bgColor}`}>
                          <Icon className={`h-6 w-6 ${module.color}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                      >
                        <span>Access Module →</span>
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/profile">My Profile</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <AdminDashboardContent />
    </AdminLayout>
  );
}
