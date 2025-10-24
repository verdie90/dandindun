"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { hasPermission } from "@/lib/auth-service";
import {
  canAccessPage,
  canPerformOperation,
  getOperationPermissionsMap,
  getPagePermissionsForRole,
  CRUDOperation,
  PagePath,
} from "@/lib/role-permission-service";

export interface PermissionState {
  pagePermissions: Record<PagePath, CRUDOperation[]>;
  operationPermissions: Record<string, boolean>;
  loading: boolean;
  error: string | null;
}

export function usePermission() {
  const { session } = useAuth();
  const [state, setState] = useState<PermissionState>({
    pagePermissions: {},
    operationPermissions: {},
    loading: true,
    error: null,
  });

  // Load permissions on mount or when user changes
  useEffect(() => {
    const loadPermissions = async () => {
      if (!session.isAuthenticated || !session.user?.role) {
        setState({
          pagePermissions: {},
          operationPermissions: {},
          loading: false,
          error: "Not authenticated",
        });
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Get page permissions
        const pagePerms = await getPagePermissionsForRole(session.user.role);
        const pagePermMap: Record<PagePath, CRUDOperation[]> = {};
        for (const perm of pagePerms) {
          pagePermMap[perm.pagePath] = perm.operations;
        }

        // Get operation permissions
        const opPermsMap = await getOperationPermissionsMap(session.user.role);

        setState({
          pagePermissions: pagePermMap,
          operationPermissions: opPermsMap,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load permissions",
        }));
      }
    };

    loadPermissions();
  }, [session.isAuthenticated, session.user?.role]);

  // Legacy permission check (backward compatible)
  const check = useCallback(
    (permission: string): boolean => {
      if (!session.user) return false;

      try {
        const permissionKey = permission as keyof typeof import("@/lib/types/auth").ROLE_PERMISSIONS["admin"];
        return hasPermission(session.user.role, permissionKey);
      } catch {
        return false;
      }
    },
    [session.user]
  );

  // Check role
  const checkRole = useCallback(
    (role: string | string[]): boolean => {
      if (!session.user) return false;

      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(session.user.role);
    },
    [session.user]
  );

  // Check if user is Super Admin
  const isSuperAdmin = useCallback(
    (): boolean => {
      if (!session.user) return false;
      return session.user.role === "super_admin";
    },
    [session.user]
  );

  // Check page access
  const canAccess = useCallback(
    async (pagePath: PagePath, operations?: CRUDOperation[]): Promise<boolean> => {
      if (!session.user?.role) return false;

      try {
        return await canAccessPage(session.user.role, pagePath, operations);
      } catch (error) {
        console.error("Permission check failed:", error);
        return false;
      }
    },
    [session.user?.role]
  );

  // Check operation permission
  const canPerform = useCallback(
    async (operationName: string): Promise<boolean> => {
      if (!session.user?.role) return false;

      try {
        return await canPerformOperation(session.user.role, operationName);
      } catch (error) {
        console.error("Operation permission check failed:", error);
        return false;
      }
    },
    [session.user?.role]
  );

  // Synchronous CRUD checks (from cached permissions)
  const canCreate = useCallback(
    (pagePath: PagePath): boolean => {
      const ops = state.pagePermissions[pagePath];
      return ops ? ops.includes("CREATE") : false;
    },
    [state.pagePermissions]
  );

  const canRead = useCallback(
    (pagePath: PagePath): boolean => {
      const ops = state.pagePermissions[pagePath];
      return ops ? ops.includes("READ") : false;
    },
    [state.pagePermissions]
  );

  const canUpdate = useCallback(
    (pagePath: PagePath): boolean => {
      const ops = state.pagePermissions[pagePath];
      return ops ? ops.includes("UPDATE") : false;
    },
    [state.pagePermissions]
  );

  const canDelete = useCallback(
    (pagePath: PagePath): boolean => {
      const ops = state.pagePermissions[pagePath];
      return ops ? ops.includes("DELETE") : false;
    },
    [state.pagePermissions]
  );

  const hasPageAccess = useCallback(
    (pagePath: PagePath): boolean => {
      return pagePath in state.pagePermissions;
    },
    [state.pagePermissions]
  );

  const isOperationAllowed = useCallback(
    (operationName: string): boolean => {
      return state.operationPermissions[operationName] === true;
    },
    [state.operationPermissions]
  );

  return {
    // State
    loading: state.loading,
    error: state.error,

    // Legacy methods (backward compatible)
    check,
    checkRole,
    isSuperAdmin,

    // New async permission methods
    canAccess,
    canPerform,

    // CRUD checks (synchronous from cache)
    canCreate,
    canRead,
    canUpdate,
    canDelete,

    // General checks
    hasPageAccess,
    isOperationAllowed,

    // Raw data
    pagePermissions: state.pagePermissions,
    operationPermissions: state.operationPermissions,

    // User info
    user: session.user,
    isAuthenticated: session.isAuthenticated,
  };
}
