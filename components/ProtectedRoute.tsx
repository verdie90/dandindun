"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { session } = useAuth();
  const { check, checkRole } = usePermission();

  useEffect(() => {
    if (session.isLoading) return;

    // Check authentication
    if (!session.isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Check role
    if (requiredRole && !checkRole(requiredRole)) {
      router.push("/dashboard");
      return;
    }

    // Check permission
    if (requiredPermission && !check(requiredPermission)) {
      router.push("/dashboard");
      return;
    }
  }, [
    session.isLoading,
    session.isAuthenticated,
    requiredRole,
    requiredPermission,
    router,
    check,
    checkRole,
  ]);

  if (session.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session.isAuthenticated) {
    return fallback || null;
  }

  if (requiredRole && !checkRole(requiredRole)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    );
  }

  if (requiredPermission && !check(requiredPermission)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
