// Role types - Aligned with Firestore
export type UserRole = "super_admin" | "admin" | "moderator" | "user";

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Session interface
export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register credentials
export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

// Role permissions
export interface RolePermissions {
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canManageContent: boolean;
  canModerateContent: boolean;
  canManageRoles: boolean;
  canManagePermissions: boolean;
  canManageSettings: boolean;
  hasFullAccess: boolean;
}

// Role config - Aligned with Firestore structure
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    // Super Admin has full access to everything
    canViewDashboard: true,
    canManageUsers: true,
    canManageContent: true,
    canModerateContent: true,
    canManageRoles: true,
    canManagePermissions: true,
    canManageSettings: true,
    hasFullAccess: true,
  },
  admin: {
    canViewDashboard: true,
    canManageUsers: true,
    canManageContent: true,
    canModerateContent: true,
    canManageRoles: false,
    canManagePermissions: false,
    canManageSettings: false,
    hasFullAccess: false,
  },
  moderator: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageContent: false,
    canModerateContent: true,
    canManageRoles: false,
    canManagePermissions: false,
    canManageSettings: false,
    hasFullAccess: false,
  },
  user: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageContent: false,
    canModerateContent: false,
    canManageRoles: false,
    canManagePermissions: false,
    canManageSettings: false,
    hasFullAccess: false,
  },
};
