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
