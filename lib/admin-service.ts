import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { User, UserRole } from "./types/auth";
import { logActivity } from "./user-service";
import { Role, getAllRoles, canPerformOperation } from "./role-permission-service";

const USERS_COLLECTION = "users";
const ACTIVITY_LOGS_COLLECTION = "activity_logs";
const AUDIT_LOGS_COLLECTION = "audit_logs";

export interface UserManagementData extends User {
  status?: "active" | "inactive" | "deleted" | "banned";
  lastLogin?: Date;
  loginCount?: number;
  isActive?: boolean;
}

export interface AdminAuditLog {
  id?: string;
  adminId: string;
  action: "UPDATE_ROLE" | "DEACTIVATE" | "ACTIVATE" | "BAN" | "UNBAN" | "DELETE";
  targetUserId: string;
  targetEmail: string;
  changes: Record<string, any>;
  timestamp: Date;
  reason?: string;
}

/**
 * Get all users with management data
 */
export const getAllUsersForAdmin = async (): Promise<UserManagementData[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status || "active",
        isActive: data.isActive ?? data.status !== "deleted",
        lastLogin: data.lastLogin?.toDate?.() || null,
        loginCount: data.loginCount || 0,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      } as UserManagementData;
    });
  } catch (error) {
    console.error("Failed to get users for admin:", error);
    throw new Error("Failed to load users");
  }
};

/**
 * Search users
 */
export const searchUsersForAdmin = async (
  searchTerm: string
): Promise<UserManagementData[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    
    // Firebase doesn't support partial string search, so we fetch all and filter
    const snapshot = await getDocs(usersRef);
    const searchLower = searchTerm.toLowerCase();

    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          status: data.status || "active",
          isActive: data.isActive ?? data.status !== "deleted",
          lastLogin: data.lastLogin?.toDate?.() || null,
          loginCount: data.loginCount || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        } as UserManagementData;
      })
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
  } catch (error) {
    console.error("Failed to search users:", error);
    throw new Error("Failed to search users");
  }
};

/**
 * Update user role with audit log
 */
export const updateUserRoleAsAdmin = async (
  adminId: string,
  userId: string,
  newRole: UserRole,
  reason?: string
): Promise<void> => {
  try {
    // Get user data before update
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const oldData = userDoc.data();
    const oldRole = oldData.role;

    // Update user role
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    // Log to audit trail
    await logAdminAction(adminId, "UPDATE_ROLE", userId, oldData.email, {
      oldRole,
      newRole,
    }, reason);

    // Log activity
    await logActivity(
      userId,
      "ROLE_CHANGED",
      `Role changed from ${oldRole} to ${newRole} by admin`
    );
  } catch (error) {
    console.error("Failed to update user role:", error);
    throw error instanceof Error ? error : new Error("Failed to update user role");
  }
};

/**
 * Deactivate user account
 */
export const deactivateUserAsAdmin = async (
  adminId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: "inactive",
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    await logAdminAction(
      adminId,
      "DEACTIVATE",
      userId,
      userData.email,
      { status: "inactive" },
      reason
    );

    await logActivity(userId, "ACCOUNT_DEACTIVATED", "Account deactivated by admin");
  } catch (error) {
    console.error("Failed to deactivate user:", error);
    throw error instanceof Error ? error : new Error("Failed to deactivate user");
  }
};

/**
 * Activate user account
 */
export const activateUserAsAdmin = async (
  adminId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: "active",
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    await logAdminAction(
      adminId,
      "ACTIVATE",
      userId,
      userData.email,
      { status: "active" },
      reason
    );

    await logActivity(userId, "ACCOUNT_ACTIVATED", "Account activated by admin");
  } catch (error) {
    console.error("Failed to activate user:", error);
    throw error instanceof Error ? error : new Error("Failed to activate user");
  }
};

/**
 * Ban user account
 */
export const banUserAsAdmin = async (
  adminId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  try {
    // Check permission
    const canBan = await canPerformOperation(adminId, "banUser");
    if (!canBan) {
      throw new Error("You don't have permission to ban users");
    }

    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: "banned",
      isActive: false,
      bannedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await logAdminAction(
      adminId,
      "BAN",
      userId,
      userData.email,
      { status: "banned" },
      reason
    );

    await logActivity(userId, "ACCOUNT_BANNED", `Account banned by admin. Reason: ${reason || "No reason provided"}`);
  } catch (error) {
    console.error("Failed to ban user:", error);
    throw error instanceof Error ? error : new Error("Failed to ban user");
  }
};

/**
 * Unban user account
 */
export const unbanUserAsAdmin = async (
  adminId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  try {
    // Check permission
    const canUnban = await canPerformOperation(adminId, "unbanUser");
    if (!canUnban) {
      throw new Error("You don't have permission to unban users");
    }

    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: "active",
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    await logAdminAction(
      adminId,
      "UNBAN",
      userId,
      userData.email,
      { status: "active" },
      reason
    );

    await logActivity(userId, "ACCOUNT_UNBANNED", "Account unbanned by admin");
  } catch (error) {
    console.error("Failed to unban user:", error);
    throw error instanceof Error ? error : new Error("Failed to unban user");
  }
};

/**
 * Delete user permanently (soft delete)
 */
export const deleteUserAsAdmin = async (
  adminId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  try {
    // Check permission
    const canDelete = await canPerformOperation(adminId, "deleteUser");
    if (!canDelete) {
      throw new Error("You don't have permission to delete users");
    }

    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: "deleted",
      isActive: false,
      deletedAt: new Date().toISOString(),
      deletedBy: adminId,
      updatedAt: new Date().toISOString(),
    });

    await logAdminAction(
      adminId,
      "DELETE",
      userId,
      userData.email,
      { status: "deleted" },
      reason
    );

    await logActivity(userId, "ACCOUNT_DELETED", "Account deleted by admin");
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error instanceof Error ? error : new Error("Failed to delete user");
  }
};

/**
 * Log admin action to audit trail
 */
export const logAdminAction = async (
  adminId: string,
  action: AdminAuditLog["action"],
  targetUserId: string,
  targetEmail: string,
  changes: Record<string, any>,
  reason?: string
): Promise<void> => {
  try {
    await setDoc(doc(collection(db, AUDIT_LOGS_COLLECTION)), {
      adminId,
      action,
      targetUserId,
      targetEmail,
      changes,
      reason: reason || null,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // Don't throw - audit logging failure shouldn't break the main action
  }
};

/**
 * Get admin audit logs
 */
export const getAdminAuditLogs = async (
  adminId?: string,
  limit: number = 100
): Promise<AdminAuditLog[]> => {
  try {
    let q;
    const logsRef = collection(db, AUDIT_LOGS_COLLECTION);

    if (adminId) {
      q = query(logsRef, where("adminId", "==", adminId), orderBy("timestamp", "desc"));
    } else {
      q = query(logsRef, orderBy("timestamp", "desc"));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        adminId: data.adminId,
        action: data.action,
        targetUserId: data.targetUserId,
        targetEmail: data.targetEmail,
        changes: data.changes,
        reason: data.reason,
        timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
      } as AdminAuditLog;
    });
  } catch (error) {
    console.error("Failed to get audit logs:", error);
    return [];
  }
};

/**
 * Get user statistics
 */
export const getUserStatsForAdmin = async () => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    const stats = {
      total: 0,
      active: 0,
      inactive: 0,
      banned: 0,
      deleted: 0,
      byRole: {
        admin: 0,
        moderator: 0,
        user: 0,
      },
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      stats.total++;

      // Count by status
      const status = data.status || "active";
      if (status === "active" || status === undefined) stats.active++;
      else if (status === "inactive") stats.inactive++;
      else if (status === "banned") stats.banned++;
      else if (status === "deleted") stats.deleted++;

      // Count by role
      if (data.role === "admin") stats.byRole.admin++;
      else if (data.role === "moderator") stats.byRole.moderator++;
      else if (data.role === "user") stats.byRole.user++;
    });

    return stats;
  } catch (error) {
    console.error("Failed to get user stats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      banned: 0,
      deleted: 0,
      byRole: { admin: 0, moderator: 0, user: 0 },
    };
  }
};

/**
 * Get all available roles from Firestore
 */
export const getAvailableRoles = async (): Promise<Role[]> => {
  try {
    return await getAllRoles();
  } catch (error) {
    console.error("Failed to get roles:", error);
    return [];
  }
};

/**
 * Get role by name (for standard system roles)
 */
export const getRoleByName = async (roleName: string): Promise<Role | null> => {
  try {
    const roles = await getAllRoles();
    return roles.find(r => r.name.toLowerCase() === roleName.toLowerCase()) || null;
  } catch (error) {
    console.error("Failed to get role by name:", error);
    return null;
  }
};

/**
 * Update user role by role name (helper for standard roles)
 */
export const updateUserRoleByName = async (
  adminId: string,
  userId: string,
  roleName: string,
  reason?: string
): Promise<void> => {
  try {
    // Map role name to UserRole if it's a standard role
    let userRole: UserRole = roleName.toLowerCase() as UserRole;
    if (!["user", "moderator", "admin"].includes(userRole)) {
      throw new Error(`Invalid role: ${roleName}`);
    }

    await updateUserRoleAsAdmin(adminId, userId, userRole, reason);
  } catch (error) {
    console.error("Failed to update user role by name:", error);
    throw error instanceof Error ? error : new Error("Failed to update user role");
  }
};

/**
 * Restore deleted user
 */
export const restoreDeletedUser = async (
  adminId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    if (userData.status !== "deleted") {
      throw new Error("User is not deleted");
    }

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: "active",
      isActive: true,
      restoredAt: new Date().toISOString(),
      restoredBy: adminId,
      updatedAt: new Date().toISOString(),
    });

    await logAdminAction(
      adminId,
      "ACTIVATE",
      userId,
      userData.email,
      { status: "active", action: "restored" },
      reason
    );

    await logActivity(userId, "ACCOUNT_RESTORED", "Deleted account restored by admin");
  } catch (error) {
    console.error("Failed to restore deleted user:", error);
    throw error instanceof Error ? error : new Error("Failed to restore user");
  }
};

/**
 * Permanently delete user (hard delete - destructive)
 */
export const permanentlyDeleteUser = async (
  adminId: string,
  userId: string,
  reason?: string
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();

    // Delete user document
    await deleteDoc(doc(db, USERS_COLLECTION, userId));

    // Log the permanent deletion
    await logAdminAction(
      adminId,
      "DELETE",
      userId,
      userData.email,
      { action: "permanently_deleted" },
      reason || "Permanent deletion"
    );
  } catch (error) {
    console.error("Failed to permanently delete user:", error);
    throw error instanceof Error ? error : new Error("Failed to delete user");
  }
};

/**
 * Bulk update user roles
 */
export const bulkUpdateUserRoles = async (
  adminId: string,
  userIds: string[],
  newRole: UserRole,
  reason?: string
): Promise<{ success: number; failed: number; errors: Record<string, string> }> => {
  const errors: Record<string, string> = {};
  let successCount = 0;
  let failedCount = 0;

  for (const userId of userIds) {
    try {
      await updateUserRoleAsAdmin(adminId, userId, newRole, reason);
      successCount++;
    } catch (error) {
      failedCount++;
      errors[userId] = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return { success: successCount, failed: failedCount, errors };
};

/**
 * Bulk deactivate users
 */
export const bulkDeactivateUsers = async (
  adminId: string,
  userIds: string[],
  reason?: string
): Promise<{ success: number; failed: number; errors: Record<string, string> }> => {
  const errors: Record<string, string> = {};
  let successCount = 0;
  let failedCount = 0;

  for (const userId of userIds) {
    try {
      await deactivateUserAsAdmin(adminId, userId, reason);
      successCount++;
    } catch (error) {
      failedCount++;
      errors[userId] = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return { success: successCount, failed: failedCount, errors };
};

/**
 * Bulk activate users
 */
export const bulkActivateUsers = async (
  adminId: string,
  userIds: string[],
  reason?: string
): Promise<{ success: number; failed: number; errors: Record<string, string> }> => {
  const errors: Record<string, string> = {};
  let successCount = 0;
  let failedCount = 0;

  for (const userId of userIds) {
    try {
      await activateUserAsAdmin(adminId, userId, reason);
      successCount++;
    } catch (error) {
      failedCount++;
      errors[userId] = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return { success: successCount, failed: failedCount, errors };
};

/**
 * Bulk ban users
 */
export const bulkBanUsers = async (
  adminId: string,
  userIds: string[],
  reason?: string
): Promise<{ success: number; failed: number; errors: Record<string, string> }> => {
  const errors: Record<string, string> = {};
  let successCount = 0;
  let failedCount = 0;

  for (const userId of userIds) {
    try {
      await banUserAsAdmin(adminId, userId, reason);
      successCount++;
    } catch (error) {
      failedCount++;
      errors[userId] = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return { success: successCount, failed: failedCount, errors };
};

/**
 * Bulk delete users
 */
export const bulkDeleteUsers = async (
  adminId: string,
  userIds: string[],
  reason?: string
): Promise<{ success: number; failed: number; errors: Record<string, string> }> => {
  const errors: Record<string, string> = {};
  let successCount = 0;
  let failedCount = 0;

  for (const userId of userIds) {
    try {
      await deleteUserAsAdmin(adminId, userId, reason);
      successCount++;
    } catch (error) {
      failedCount++;
      errors[userId] = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return { success: successCount, failed: failedCount, errors };
};

/**
 * Advanced search with filters
 */
export const advancedSearchUsers = async (
  filters: {
    searchTerm?: string;
    role?: UserRole;
    status?: "active" | "inactive" | "banned" | "deleted";
    createdAfter?: Date;
    createdBefore?: Date;
    loginAfter?: Date;
    loginBefore?: Date;
  }
): Promise<UserManagementData[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    let results = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status || "active",
        isActive: data.isActive ?? data.status !== "deleted",
        lastLogin: data.lastLogin?.toDate?.() || null,
        loginCount: data.loginCount || 0,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      } as UserManagementData;
    });

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      results = results.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (filters.role) {
      results = results.filter((user) => user.role === filters.role);
    }

    // Apply status filter
    if (filters.status) {
      results = results.filter((user) => (user.status || "active") === filters.status);
    }

    // Apply date range filters
    if (filters.createdAfter) {
      results = results.filter((user) => user.createdAt >= filters.createdAfter!);
    }
    if (filters.createdBefore) {
      results = results.filter((user) => user.createdAt <= filters.createdBefore!);
    }
    if (filters.loginAfter && filters.loginAfter) {
      results = results.filter((user) => user.lastLogin && user.lastLogin >= filters.loginAfter!);
    }
    if (filters.loginBefore && filters.loginBefore) {
      results = results.filter((user) => user.lastLogin && user.lastLogin <= filters.loginBefore!);
    }

    return results;
  } catch (error) {
    console.error("Failed to search users with filters:", error);
    return [];
  }
};

/**
 * Get users by status
 */
export const getUsersByStatus = async (
  status: "active" | "inactive" | "banned" | "deleted"
): Promise<UserManagementData[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("status", "==", status));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
        isActive: data.isActive,
        lastLogin: data.lastLogin?.toDate?.() || null,
        loginCount: data.loginCount || 0,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      } as UserManagementData;
    });
  } catch (error) {
    console.error("Failed to get users by status:", error);
    return [];
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<UserManagementData[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("role", "==", role));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status || "active",
        isActive: data.isActive ?? true,
        lastLogin: data.lastLogin?.toDate?.() || null,
        loginCount: data.loginCount || 0,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      } as UserManagementData;
    });
  } catch (error) {
    console.error("Failed to get users by role:", error);
    return [];
  }
};

/**
 * Export users data
 */
export const exportUsersData = async (userIds?: string[]): Promise<string> => {
  try {
    let users: UserManagementData[];

    if (userIds && userIds.length > 0) {
      const usersRef = collection(db, USERS_COLLECTION);
      const snapshot = await getDocs(usersRef);
      users = snapshot.docs
        .filter((doc) => userIds.includes(doc.id))
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email,
            name: data.name,
            role: data.role,
            status: data.status || "active",
            isActive: data.isActive ?? true,
            lastLogin: data.lastLogin?.toDate?.()?.toISOString() || null,
            loginCount: data.loginCount || 0,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date(data.updatedAt),
          } as UserManagementData;
        });
    } else {
      users = await getAllUsersForAdmin();
    }

    // Convert to CSV
    const headers = ["ID", "Name", "Email", "Role", "Status", "Login Count", "Created At", "Last Login"];
    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.status || "active",
      user.loginCount || 0,
      user.createdAt?.toISOString?.() || "",
      user.lastLogin?.toISOString?.() || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csv;
  } catch (error) {
    console.error("Failed to export users data:", error);
    throw new Error("Failed to export users data");
  }
};
