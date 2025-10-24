"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { PagePath, CRUDOperation } from "@/lib/role-permission-service";
import { Loader2 } from "lucide-react";

interface ProtectedPageProps {
  children: ReactNode;
  requiredPage: PagePath;
  requiredOperations?: CRUDOperation[];
  fallback?: ReactNode;
}

/**
 * Component to protect pages based on permissions
 */
export function ProtectedPage({
  children,
  requiredPage,
  requiredOperations = ["READ"],
  fallback,
}: ProtectedPageProps) {
  const router = useRouter();
  const { hasPageAccess, canRead, canCreate, canUpdate, canDelete, loading } =
    usePermission();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Check if user has access to page
  if (!hasPageAccess(requiredPage)) {
    return fallback || <AccessDenied page={requiredPage} />;
  }

  // Check required operations
  if (requiredOperations.length > 0) {
    const hasAllOps = requiredOperations.every((op) => {
      switch (op) {
        case "CREATE":
          return canCreate(requiredPage);
        case "READ":
          return canRead(requiredPage);
        case "UPDATE":
          return canUpdate(requiredPage);
        case "DELETE":
          return canDelete(requiredPage);
        default:
          return false;
      }
    });

    if (!hasAllOps) {
      return fallback || <AccessDenied page={requiredPage} />;
    }
  }

  return <>{children}</>;
}

interface AccessDeniedProps {
  page?: string;
}

/**
 * Access denied fallback component
 */
function AccessDenied({ page }: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to access {page || "this page"}.
        </p>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

/**
 * Hook to redirect if no access
 */
export function useRequirePageAccess(
  requiredPage: PagePath,
  requiredOperations?: CRUDOperation[]
) {
  const router = useRouter();
  const { hasPageAccess, canRead, canCreate, canUpdate, canDelete, loading } =
    usePermission();

  if (!loading && !hasPageAccess(requiredPage)) {
    router.push("/dashboard");
    return { hasAccess: false, loading };
  }

  if (requiredOperations && requiredOperations.length > 0) {
    const hasAllOps = requiredOperations.every((op) => {
      switch (op) {
        case "CREATE":
          return canCreate(requiredPage);
        case "READ":
          return canRead(requiredPage);
        case "UPDATE":
          return canUpdate(requiredPage);
        case "DELETE":
          return canDelete(requiredPage);
        default:
          return false;
      }
    });

    if (!loading && !hasAllOps) {
      router.push("/dashboard");
      return { hasAccess: false, loading };
    }
  }

  return { hasAccess: true, loading };
}

/**
 * Hook to redirect if no operation permission
 */
export function useRequireOperationAccess(operationName: string) {
  const router = useRouter();
  const { isOperationAllowed, loading } = usePermission();

  if (!loading && !isOperationAllowed(operationName)) {
    router.push("/dashboard");
    return { hasAccess: false, loading };
  }

  return { hasAccess: true, loading };
}
