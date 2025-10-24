"use client";

import { useAuth } from "@/components/AuthProvider";
import { hasPermission } from "@/lib/auth-service";

export function usePermission() {
  const { session } = useAuth();

  const check = (permission: string): boolean => {
    if (!session.user) return false;
    
    // Type assertion since we know it's a valid permission key
    const permissionKey = permission as keyof typeof import("@/lib/types/auth").ROLE_PERMISSIONS["admin"];
    return hasPermission(session.user.role, permissionKey);
  };

  const checkRole = (role: string | string[]): boolean => {
    if (!session.user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(session.user.role);
  };

  return {
    check,
    checkRole,
    user: session.user,
    isAuthenticated: session.isAuthenticated,
  };
}
