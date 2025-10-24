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
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const ROLES_COLLECTION = "roles";
const PERMISSIONS_COLLECTION = "permissions";
const PAGE_PERMISSIONS_COLLECTION = "page_permissions";
const OPERATION_PERMISSIONS_COLLECTION = "operation_permissions";

// ============= Types & Interfaces =============

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // permission IDs
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Page-based permissions
export type PagePath = string; // e.g., "/admin", "/admin/users", "/dashboard"
export type CRUDOperation = "CREATE" | "READ" | "UPDATE" | "DELETE";

export interface PagePermission {
  id: string;
  roleId: string;
  pagePath: PagePath;
  operations: CRUDOperation[];
  canAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationPermission {
  id: string;
  roleId: string;
  operationName: string; // e.g., "deleteUser", "editProfile"
  allowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PagePermissionMatrix {
  roleId: string;
  roleName: string;
  permissions: {
    pagePath: PagePath;
    operations: {
      CREATE: boolean;
      READ: boolean;
      UPDATE: boolean;
      DELETE: boolean;
    };
  }[];
}

export interface RolePermissionMatrix {
  roleId: string;
  roleName: string;
  pagePermissions: Record<PagePath, CRUDOperation[]>;
  operationPermissions: Record<string, boolean>;
}

/**
 * Create a new role
 */
export const createRole = async (roleData: {
  name: string;
  description: string;
  permissions: string[];
}): Promise<Role> => {
  try {
    const roleId = doc(collection(db, ROLES_COLLECTION)).id;
    const role: Role = {
      id: roleId,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      isSystemRole: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, ROLES_COLLECTION, roleId), {
      ...role,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    });

    return role;
  } catch (error) {
    throw new Error("Failed to create role");
  }
};

/**
 * Update role
 */
export const updateRole = async (
  roleId: string,
  roleData: Partial<Omit<Role, "id" | "isSystemRole" | "createdAt">>
): Promise<void> => {
  try {
    await updateDoc(doc(db, ROLES_COLLECTION, roleId), {
      ...roleData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error("Failed to update role");
  }
};

/**
 * Delete role
 */
export const deleteRole = async (roleId: string): Promise<void> => {
  try {
    const roleDoc = await getDoc(doc(db, ROLES_COLLECTION, roleId));
    if (!roleDoc.exists()) {
      throw new Error("Role not found");
    }

    const role = roleDoc.data() as Role;
    if (role.isSystemRole) {
      throw new Error("Cannot delete system roles");
    }

    await deleteDoc(doc(db, ROLES_COLLECTION, roleId));
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to delete role");
  }
};

/**
 * Get role by ID
 */
export const getRole = async (roleId: string): Promise<Role | null> => {
  try {
    const roleDoc = await getDoc(doc(db, ROLES_COLLECTION, roleId));
    if (!roleDoc.exists()) {
      return null;
    }

    const data = roleDoc.data() as Omit<Role, "id"> & {
      createdAt: string;
      updatedAt: string;
    };

    return {
      id: roleDoc.id,
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      isSystemRole: data.isSystemRole,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  } catch (error) {
    return null;
  }
};

/**
 * Get all roles
 */
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const rolesRef = collection(db, ROLES_COLLECTION);
    const snapshot = await getDocs(rolesRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Role, "id"> & {
        createdAt: string;
        updatedAt: string;
      };
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        isSystemRole: data.isSystemRole,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  } catch (error) {
    return [];
  }
};

/**
 * Create permission
 */
export const createPermission = async (permissionData: {
  name: string;
  description: string;
  category: string;
}): Promise<Permission> => {
  try {
    const permId = doc(collection(db, PERMISSIONS_COLLECTION)).id;
    const permission: Permission = {
      id: permId,
      name: permissionData.name,
      description: permissionData.description,
      category: permissionData.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, PERMISSIONS_COLLECTION, permId), {
      ...permission,
      createdAt: permission.createdAt.toISOString(),
      updatedAt: permission.updatedAt.toISOString(),
    });

    return permission;
  } catch (error) {
    throw new Error("Failed to create permission");
  }
};

/**
 * Get all permissions
 */
export const getAllPermissions = async (): Promise<Permission[]> => {
  try {
    const permsRef = collection(db, PERMISSIONS_COLLECTION);
    const snapshot = await getDocs(permsRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Permission, "id"> & {
        createdAt: string;
        updatedAt: string;
      };
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        category: data.category,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  } catch (error) {
    return [];
  }
};

/**
 * Delete permission
 */
export const deletePermission = async (permissionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PERMISSIONS_COLLECTION, permissionId));
  } catch (error) {
    throw new Error("Failed to delete permission");
  }
};

/**
 * Get role permissions
 */
export const getRolePermissions = async (roleId: string): Promise<Permission[]> => {
  try {
    const role = await getRole(roleId);
    if (!role) return [];

    const permissions = await Promise.all(
      role.permissions.map(async (permId) => {
        const permDoc = await getDoc(doc(db, PERMISSIONS_COLLECTION, permId));
        if (!permDoc.exists()) return null;

        const data = permDoc.data() as Omit<Permission, "id"> & {
          createdAt: string;
          updatedAt: string;
        };

        return {
          id: permDoc.id,
          name: data.name,
          description: data.description,
          category: data.category,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        };
      })
    );

    return permissions.filter((p): p is Permission => p !== null);
  } catch (error) {
    return [];
  }
};

/**
 * Assign permissions to role
 */
export const assignPermissionsToRole = async (
  roleId: string,
  permissionIds: string[]
): Promise<void> => {
  try {
    await updateRole(roleId, { permissions: permissionIds });
  } catch (error) {
    throw new Error("Failed to assign permissions");
  }
};

/**
 * Initialize default roles and permissions
 */
export const initializeDefaultRoles = async (): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Default permissions
    const defaultPermissions = [
      {
        id: "view_dashboard",
        name: "View Dashboard",
        description: "Access to dashboard",
        category: "dashboard",
      },
      {
        id: "manage_users",
        name: "Manage Users",
        description: "Create, edit, delete users",
        category: "users",
      },
      {
        id: "manage_roles",
        name: "Manage Roles",
        description: "Create and modify roles",
        category: "roles",
      },
      {
        id: "manage_permissions",
        name: "Manage Permissions",
        description: "Create and modify permissions",
        category: "permissions",
      },
      {
        id: "manage_content",
        name: "Manage Content",
        description: "Create, edit, delete content",
        category: "content",
      },
      {
        id: "moderate_content",
        name: "Moderate Content",
        description: "Review and moderate user content",
        category: "moderation",
      },
      {
        id: "view_analytics",
        name: "View Analytics",
        description: "Access analytics and reports",
        category: "analytics",
      },
      {
        id: "manage_settings",
        name: "Manage Settings",
        description: "Configure application settings",
        category: "settings",
      },
    ];

    // Add default permissions
    for (const perm of defaultPermissions) {
      batch.set(doc(db, PERMISSIONS_COLLECTION, perm.id), {
        ...perm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Default roles
    const defaultRoles = [
      {
        id: "admin",
        name: "Administrator",
        description: "Full system access",
        permissions: defaultPermissions.map((p) => p.id),
        isSystemRole: true,
      },
      {
        id: "moderator",
        name: "Moderator",
        description: "Content moderation access",
        permissions: [
          "view_dashboard",
          "moderate_content",
          "view_analytics",
        ],
        isSystemRole: true,
      },
      {
        id: "user",
        name: "User",
        description: "Basic user access",
        permissions: ["view_dashboard"],
        isSystemRole: true,
      },
    ];

    // Add default roles
    for (const role of defaultRoles) {
      batch.set(doc(db, ROLES_COLLECTION, role.id), {
        ...role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await batch.commit();
  } catch (error) {
    console.error("Failed to initialize default roles:", error);
  }
};

// ============= PAGE PERMISSION FUNCTIONS =============

/**
 * Set page access permissions for a role
 */
export const setPagePermission = async (
  roleId: string,
  pagePath: PagePath,
  operations: CRUDOperation[]
): Promise<void> => {
  try {
    const permId = `${roleId}_${pagePath}_${Date.now()}`;
    await setDoc(
      doc(db, PAGE_PERMISSIONS_COLLECTION, permId),
      {
        roleId,
        pagePath,
        operations,
        canAccess: operations.length > 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    throw new Error(`Failed to set page permission for ${pagePath}`);
  }
};

/**
 * Get page permissions for a role
 */
export const getPagePermissionsForRole = async (
  roleId: string
): Promise<PagePermission[]> => {
  try {
    const permRef = collection(db, PAGE_PERMISSIONS_COLLECTION);
    const q = query(permRef, where("roleId", "==", roleId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<PagePermission, "id" | "createdAt" | "updatedAt"> & {
        createdAt: string;
        updatedAt: string;
      };
      return {
        id: doc.id,
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  } catch (error) {
    console.error("Failed to get page permissions:", error);
    return [];
  }
};

/**
 * Check if role can access page with specific operations
 */
export const canAccessPage = async (
  roleId: string,
  pagePath: PagePath,
  operations?: CRUDOperation[]
): Promise<boolean> => {
  try {
    // Super Admin bypass - has full access to all pages
    const role = await getRole(roleId);
    if (role && (role.name === "super_admin" || role.name === "Super Admin")) {
      return true;
    }

    const permRef = collection(db, PAGE_PERMISSIONS_COLLECTION);
    const q = query(
      permRef,
      where("roleId", "==", roleId),
      where("pagePath", "==", pagePath),
      where("canAccess", "==", true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return false;

    // If specific operations required, check if they're all allowed
    if (operations && operations.length > 0) {
      const perm = snapshot.docs[0].data();
      return operations.every((op) => (perm.operations as CRUDOperation[]).includes(op));
    }

    return true;
  } catch (error) {
    console.error("Failed to check page access:", error);
    return false;
  }
};

/**
 * Get all page permissions for all roles (matrix view)
 */
export const getPagePermissionMatrix = async (
  roleId?: string
): Promise<PagePermissionMatrix[]> => {
  try {
    let query_;
    const permRef = collection(db, PAGE_PERMISSIONS_COLLECTION);

    if (roleId) {
      query_ = query(permRef, where("roleId", "==", roleId));
    } else {
      query_ = query(permRef);
    }

    const snapshot = await getDocs(query_);
    const grouped: Record<string, PagePermissionMatrix> = {};

    for (const doc of snapshot.docs) {
      const data = doc.data() as Omit<PagePermission, "createdAt" | "updatedAt"> & {
        createdAt: string;
        updatedAt: string;
      };

      if (!grouped[data.roleId]) {
        const role = await getRole(data.roleId);
        grouped[data.roleId] = {
          roleId: data.roleId,
          roleName: role?.name || "Unknown",
          permissions: [],
        };
      }

      grouped[data.roleId].permissions.push({
        pagePath: data.pagePath,
        operations: {
          CREATE: (data.operations as CRUDOperation[]).includes("CREATE"),
          READ: (data.operations as CRUDOperation[]).includes("READ"),
          UPDATE: (data.operations as CRUDOperation[]).includes("UPDATE"),
          DELETE: (data.operations as CRUDOperation[]).includes("DELETE"),
        },
      });
    }

    return Object.values(grouped);
  } catch (error) {
    console.error("Failed to get page permission matrix:", error);
    return [];
  }
};

// ============= OPERATION PERMISSION FUNCTIONS =============

/**
 * Set specific operation permission for a role
 */
export const setOperationPermission = async (
  roleId: string,
  operationName: string,
  allowed: boolean
): Promise<void> => {
  try {
    const permId = `${roleId}_${operationName}`;
    await setDoc(
      doc(db, OPERATION_PERMISSIONS_COLLECTION, permId),
      {
        roleId,
        operationName,
        allowed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    throw new Error(`Failed to set operation permission for ${operationName}`);
  }
};

/**
 * Get operation permissions for a role
 */
export const getOperationPermissionsForRole = async (
  roleId: string
): Promise<OperationPermission[]> => {
  try {
    const permRef = collection(db, OPERATION_PERMISSIONS_COLLECTION);
    const q = query(permRef, where("roleId", "==", roleId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<OperationPermission, "id" | "createdAt" | "updatedAt"> & {
        createdAt: string;
        updatedAt: string;
      };
      return {
        id: doc.id,
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  } catch (error) {
    console.error("Failed to get operation permissions:", error);
    return [];
  }
};

/**
 * Check if role can perform specific operation
 */
export const canPerformOperation = async (
  roleId: string,
  operationName: string
): Promise<boolean> => {
  try {
    // Super Admin bypass - allowed to perform all operations
    const role = await getRole(roleId);
    if (role && (role.name === "super_admin" || role.name === "Super Admin")) {
      return true;
    }

    const permRef = collection(db, OPERATION_PERMISSIONS_COLLECTION);
    const q = query(
      permRef,
      where("roleId", "==", roleId),
      where("operationName", "==", operationName),
      where("allowed", "==", true)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Failed to check operation permission:", error);
    return false;
  }
};

/**
 * Get operation permissions as key-value map
 */
export const getOperationPermissionsMap = async (
  roleId: string
): Promise<Record<string, boolean>> => {
  try {
    const permissions = await getOperationPermissionsForRole(roleId);
    const map: Record<string, boolean> = {};

    for (const perm of permissions) {
      map[perm.operationName] = perm.allowed;
    }

    return map;
  } catch (error) {
    console.error("Failed to get operation permissions map:", error);
    return {};
  }
};

// ============= BULK PERMISSION FUNCTIONS =============

/**
 * Bulk set page permissions for a role
 */
export const bulkSetPagePermissions = async (
  roleId: string,
  pagePermissions: { pagePath: PagePath; operations: CRUDOperation[] }[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    for (const perm of pagePermissions) {
      const permId = `${roleId}_${perm.pagePath}`;
      batch.set(
        doc(db, PAGE_PERMISSIONS_COLLECTION, permId),
        {
          roleId,
          pagePath: perm.pagePath,
          operations: perm.operations,
          canAccess: perm.operations.length > 0,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    await batch.commit();
  } catch (error) {
    throw new Error("Failed to bulk set page permissions");
  }
};

/**
 * Bulk set operation permissions for a role
 */
export const bulkSetOperationPermissions = async (
  roleId: string,
  operationPermissions: { operationName: string; allowed: boolean }[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    for (const perm of operationPermissions) {
      const permId = `${roleId}_${perm.operationName}`;
      batch.set(
        doc(db, OPERATION_PERMISSIONS_COLLECTION, permId),
        {
          roleId,
          operationName: perm.operationName,
          allowed: perm.allowed,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    await batch.commit();
  } catch (error) {
    throw new Error("Failed to bulk set operation permissions");
  }
};

/**
 * Get complete permission matrix for a role (role, page, CRUD)
 */
export const getRolePermissionMatrix = async (
  roleId: string
): Promise<RolePermissionMatrix> => {
  try {
    const role = await getRole(roleId);
    if (!role) throw new Error("Role not found");

    const pagePerms = await getPagePermissionsForRole(roleId);
    const operationPerms = await getOperationPermissionsForRole(roleId);

    const pagePermMap: Record<PagePath, CRUDOperation[]> = {};
    for (const perm of pagePerms) {
      pagePermMap[perm.pagePath] = perm.operations;
    }

    const operationPermMap: Record<string, boolean> = {};
    for (const perm of operationPerms) {
      operationPermMap[perm.operationName] = perm.allowed;
    }

    return {
      roleId,
      roleName: role.name,
      pagePermissions: pagePermMap,
      operationPermissions: operationPermMap,
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to get role permission matrix");
  }
};

/**
 * Initialize default page permissions
 */
export const initializeDefaultPagePermissions = async (): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Admin - Full access to all pages
    const adminPages = [
      { path: "/dashboard", ops: ["READ"] as CRUDOperation[] },
      { path: "/admin", ops: ["READ"] as CRUDOperation[] },
      { path: "/admin/users", ops: ["CREATE", "READ", "UPDATE", "DELETE"] as CRUDOperation[] },
      { path: "/admin/roles", ops: ["CREATE", "READ", "UPDATE", "DELETE"] as CRUDOperation[] },
      { path: "/admin/permissions", ops: ["CREATE", "READ", "UPDATE", "DELETE"] as CRUDOperation[] },
      { path: "/admin/settings", ops: ["READ", "UPDATE"] as CRUDOperation[] },
      { path: "/admin/logs", ops: ["READ"] as CRUDOperation[] },
      { path: "/profile", ops: ["READ", "UPDATE"] as CRUDOperation[] },
    ];

    for (const page of adminPages) {
      batch.set(
        doc(db, PAGE_PERMISSIONS_COLLECTION, `admin_${page.path}`),
        {
          roleId: "admin",
          pagePath: page.path,
          operations: page.ops,
          canAccess: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    }

    // Moderator - Limited access
    const moderatorPages = [
      { path: "/dashboard", ops: ["READ"] as CRUDOperation[] },
      { path: "/admin", ops: ["READ"] as CRUDOperation[] },
      { path: "/admin/users", ops: ["READ"] as CRUDOperation[] },
      { path: "/profile", ops: ["READ", "UPDATE"] as CRUDOperation[] },
    ];

    for (const page of moderatorPages) {
      batch.set(
        doc(db, PAGE_PERMISSIONS_COLLECTION, `moderator_${page.path}`),
        {
          roleId: "moderator",
          pagePath: page.path,
          operations: page.ops,
          canAccess: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    }

    // User - Basic access
    const userPages = [
      { path: "/dashboard", ops: ["READ"] as CRUDOperation[] },
      { path: "/profile", ops: ["READ", "UPDATE"] as CRUDOperation[] },
    ];

    for (const page of userPages) {
      batch.set(
        doc(db, PAGE_PERMISSIONS_COLLECTION, `user_${page.path}`),
        {
          roleId: "user",
          pagePath: page.path,
          operations: page.ops,
          canAccess: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    }

    await batch.commit();
  } catch (error) {
    console.error("Failed to initialize default page permissions:", error);
  }
};
