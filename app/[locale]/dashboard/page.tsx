"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, Users } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const { check, checkRole } = usePermission();

  // Redirect if not authenticated
  useEffect(() => {
    if (!session.isLoading && !session.isAuthenticated) {
      router.push("/auth/login");
    }
  }, [session.isAuthenticated, session.isLoading, router]);

  if (session.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session.user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500",
    moderator: "bg-yellow-500",
    user: "bg-blue-500",
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {session.user.name}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{session.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{session.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge className={`${roleColors[session.user.role]} text-white`}>
                  {session.user.role.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-semibold">
                  {session.user.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
            <CardDescription>
              Based on your role: <span className="font-semibold">{session.user.role}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    check("canViewDashboard") ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">View Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    check("canManageUsers") ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">Manage Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    check("canManageContent") ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">Manage Content</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    check("canModerateContent") ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">Moderate Content</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Section */}
        {checkRole("admin") && (
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Admin Panel
              </CardTitle>
              <CardDescription>
                You have admin access. Manage users and system settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Moderator Section */}
        {checkRole("moderator") && (
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle>Moderator Panel</CardTitle>
              <CardDescription>
                You have moderator access. Review and moderate content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Review Reported Content</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
