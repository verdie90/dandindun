// Role types
export type UserRole = "admin" | "user" | "moderator";

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
}

// Role config
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewDashboard: true,
    canManageUsers: true,
    canManageContent: true,
    canModerateContent: true,
  },
  moderator: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageContent: false,
    canModerateContent: true,
  },
  user: {
    canViewDashboard: true,
    canManageUsers: false,
    canManageContent: false,
    canModerateContent: false,
  },
};
