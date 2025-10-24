"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
} from "lucide-react";

function DashboardContent() {
  const { session } = useAuth();
  const { checkRole } = usePermission();

  const isAdmin = checkRole("admin");

  const quickStats = [
    {
      label: "Role",
      value: session.user?.role.toUpperCase(),
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      label: "Status",
      value: "Active",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    {
      label: "Joined",
      value: session.user?.createdAt.toLocaleDateString(),
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
  ];

  const adminFeatures = [
    {
      title: "Users",
      description: "Manage users and roles",
      href: "/admin/users",
      icon: "👥",
      permission: "manage_users",
    },
    {
      title: "Roles",
      description: "Configure roles",
      href: "/admin/roles",
      icon: "🛡️",
      permission: "manage_roles",
    },
    {
      title: "Sessions",
      description: "Monitor sessions",
      href: "/admin/sessions",
      icon: "⏱️",
      permission: "manage_sessions",
    },
    {
      title: "Permissions",
      description: "Manage permissions",
      href: "/admin/permissions",
      icon: "🔐",
      permission: "manage_permissions",
    },
    {
      title: "Languages",
      description: "Configure languages",
      href: "/admin/languages",
      icon: "🌍",
      permission: "manage_settings",
    },
    {
      title: "Settings",
      description: "App settings",
      href: "/admin/settings",
      icon: "⚙️",
      permission: "manage_settings",
    },
  ];

  const userFeatures = [
    {
      title: "Profile",
      description: "Edit your profile",
      href: "/profile",
      icon: "👤",
    },
    {
      title: "Security",
      description: "Change password",
      href: "/profile",
      icon: "🔒",
    },
    {
      title: "Activity",
      description: "View activity logs",
      href: "/profile",
      icon: "📋",
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Manage your account and access your dashboard
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickStats.map((stat, idx) => (
          <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {stat.label}
              </p>
              <Badge className={`${stat.color} text-sm py-1.5`}>
                {stat.value}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Email
              </p>
              <p className="font-medium break-all">{session?.user?.email}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Name
              </p>
              <p className="font-medium">{session?.user?.name}</p>
            </div>
            <Separator />
            <Button asChild className="w-full">
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        {/* User Features */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>
                Access your important features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {userFeatures.map((feature, idx) => (
                  <Link
                    key={idx}
                    href={feature.href}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-all group"
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          {isAdmin && (
            <Card className="border-0 shadow-md border-l-4 border-l-blue-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Admin Dashboard
                    </CardTitle>
                    <CardDescription>
                      System administration tools
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Administrator
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {adminFeatures.map((feature, idx) => (
                    <Link
                      key={idx}
                      href={feature.href}
                      className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-all group text-center"
                    >
                      <div className="text-2xl mb-1 group-hover:scale-110 transition-transform inline-block">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-xs">
                        {feature.title}
                      </h3>
                    </Link>
                  ))}
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/admin">Admin Dashboard →</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
          <CardHeader>
            <CardTitle className="text-base">💡 Tips & Tricks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Keep your password secure and update it regularly. Never share
              your credentials with anyone.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
          <CardHeader>
            <CardTitle className="text-base">✅ Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account is secure. All data is encrypted and protected by
              industry-standard security measures.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (mounted && !session.isAuthenticated && !session.isLoading) {
      router.push("/auth/login");
    }
  }, [session.isAuthenticated, session.isLoading, router, mounted]);

  // Show nothing while checking auth
  if (!mounted || session.isLoading) {
    return null;
  }

  // Redirect happens in effect above
  if (!session.user) {
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
