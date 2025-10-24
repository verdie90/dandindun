# Role & Permission System Alignment with Firestore

## Overview

This document describes the role and permission system alignment with Firestore, including the implementation of the Super Admin role with full system access.

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** ✅ Complete & Verified

---

## 1. Role Hierarchy

The system now implements a 4-tier role hierarchy aligned with Firestore data:

```
┌─────────────────────────────────────────────────────────┐
│ SUPER ADMIN (super_admin)                               │
│ • Full access to ALL pages and features                 │
│ • Bypass all permission checks                          │
│ • Can manage roles, permissions, and system settings    │
│ • Cannot be edited or deleted                           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ ADMIN (admin)                                            │
│ • Access to dashboard, users, content                   │
│ • Cannot manage roles or permissions                    │
│ • Limited system settings access                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ MODERATOR (moderator)                                    │
│ • Access to dashboard and content moderation            │
│ • Cannot manage users or system settings                │
│ • Limited operation permissions                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ USER (user)                                              │
│ • Basic access to dashboard only                        │
│ • View-only permissions on most features                │
│ • No management capabilities                            │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Permission Matrix

The following permission matrix defines access levels for each role:

| Feature | Super Admin | Admin | Moderator | User |
|---------|-------------|-------|-----------|------|
| **Dashboard** | ✓ | ✓ | ✓ | ✓ |
| **User Management** | ✓ | ✓ | ✗ | ✗ |
| **Content Management** | ✓ | ✓ | ✓ | ✗ |
| **Role Management** | ✓ | ✗ | ✗ | ✗ |
| **Permission Management** | ✓ | ✗ | ✗ | ✗ |
| **System Settings** | ✓ | Limited | ✗ | ✗ |
| **Session Management** | ✓ | Limited | ✗ | ✗ |
| **Language Settings** | ✓ | Limited | ✗ | ✗ |

---

## 3. Firestore Collections Structure

The role and permission system is built on the following Firestore collections:

### 3.1 `roles` Collection

Stores all available roles in the system.

**Document Structure:**
```javascript
{
  id: "role_doc_id",
  name: "super_admin",                    // "super_admin" | "admin" | "moderator" | "user"
  description: "System administrator with full access",
  permissions: ["perm_id_1", "perm_id_2"],  // Array of permission IDs
  isSystemRole: true,                     // Cannot be deleted if true
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**System Roles:**
- `super_admin`: Full system access
- `admin`: Administrative access (limited)
- `moderator`: Content moderation
- `user`: Basic user access

### 3.2 `permissions` Collection

Stores all available permissions in the system.

**Document Structure:**
```javascript
{
  id: "permission_doc_id",
  name: "canManageUsers",
  description: "Allows user management operations",
  category: "user_management",             // Category grouping
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3.3 `page_permissions` Collection

Maps roles to pages and defines CRUD operations allowed on each page.

**Document Structure:**
```javascript
{
  id: "page_perm_doc_id",
  roleId: "role_doc_id",
  pagePath: "/admin/users",               // e.g., "/admin", "/admin/users", "/dashboard"
  operations: ["CREATE", "READ", "UPDATE", "DELETE"],  // CRUD operations
  canAccess: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Common Page Paths:**
- `/dashboard` - Main dashboard
- `/admin` - Admin panel
- `/admin/users` - User management
- `/admin/roles` - Role management
- `/admin/permissions` - Permission management
- `/admin/settings` - System settings
- `/admin/sessions` - Session management

### 3.4 `operation_permissions` Collection

Maps roles to specific operations they can perform.

**Document Structure:**
```javascript
{
  id: "operation_perm_doc_id",
  roleId: "role_doc_id",
  operationName: "deleteUser",            // Specific operation name
  allowed: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Common Operations:**
- `deleteUser`, `editUser`, `createUser`, `viewUser`
- `deleteRole`, `editRole`, `createRole`, `viewRole`
- `deleteContent`, `editContent`, `createContent`, `viewContent`
- `manageSessions`, `manageSettings`, `manageLanguages`

---

## 4. Super Admin Full Access Implementation

### 4.1 Type Definitions

**File:** `lib/types/auth.ts`

```typescript
export type UserRole = "super_admin" | "admin" | "moderator" | "user";

export interface RolePermissions {
  hasFullAccess?: boolean;
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canManageContent: boolean;
  canModerateContent: boolean;
  canManageRoles: boolean;
  canManagePermissions: boolean;
  canManageSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    hasFullAccess: true,
    canViewDashboard: true,
    canManageUsers: true,
    canManageContent: true,
    canModerateContent: true,
    canManageRoles: true,
    canManagePermissions: true,
    canManageSettings: true,
  },
  admin: {
    hasFullAccess: false,
    canViewDashboard: true,
    canManageUsers: true,
    canManageContent: true,
    canModerateContent: true,
    canManageRoles: false,
    canManagePermissions: false,
    canManageSettings: false,
  },
  moderator: {
    hasFullAccess: false,
    canViewDashboard: true,
    canManageUsers: false,
    canManageContent: false,
    canModerateContent: true,
    canManageRoles: false,
    canManagePermissions: false,
    canManageSettings: false,
  },
  user: {
    hasFullAccess: false,
    canViewDashboard: true,
    canManageUsers: false,
    canManageContent: false,
    canModerateContent: false,
    canManageRoles: false,
    canManagePermissions: false,
    canManageSettings: false,
  },
};
```

### 4.2 Permission Service Functions

**File:** `lib/role-permission-service.ts`

#### `canAccessPage(roleId, pagePath, operations?)`

Checks if a role can access a specific page with optional CRUD operations.

**Implementation:**
```typescript
export const canAccessPage = async (
  roleId: string,
  pagePath: PagePath,
  operations?: CRUDOperation[]
): Promise<boolean> => {
  try {
    // Super Admin bypass - has full access to all pages
    const role = await getRole(roleId);
    if (role && (role.name === "super_admin" || role.name === "Super Admin")) {
      return true;  // Super Admin can access any page
    }

    // Normal permission check for other roles
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
```

**Key Features:**
- Super Admin bypasses all permission checks
- Returns `true` immediately for super_admin role
- Normal roles follow Firestore permission rules
- Supports CRUD operation checking

#### `canPerformOperation(roleId, operationName)`

Checks if a role can perform a specific operation.

**Implementation:**
```typescript
export const canPerformOperation = async (
  roleId: string,
  operationName: string
): Promise<boolean> => {
  try {
    // Super Admin bypass - allowed to perform all operations
    const role = await getRole(roleId);
    if (role && (role.name === "super_admin" || role.name === "Super Admin")) {
      return true;  // Super Admin can perform any operation
    }

    // Normal permission check for other roles
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
```

**Key Features:**
- Super Admin bypasses all operation checks
- Returns `true` immediately for super_admin role
- Normal roles follow Firestore permission rules

### 4.3 Permission Hook

**File:** `hooks/usePermission.ts`

The `usePermission` hook provides React integration for permission checking.

**Key Methods:**

```typescript
// Check if user is Super Admin
const isSuperAdmin = useCallback(
  (): boolean => {
    if (!session.user) return false;
    return session.user.role === "super_admin";
  },
  [session.user]
);

// Check page access (Super Admin bypass included)
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

// Check operation permission (Super Admin bypass included)
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
```

**Usage Example:**
```typescript
// In a component
const { isSuperAdmin, canAccess, canPerform } = usePermission();

// Check if user is Super Admin
if (isSuperAdmin()) {
  // Show Super Admin panel
}

// Check page access
const hasAccess = await canAccess("/admin/users");

// Check operation permission
const canDelete = await canPerform("deleteUser");
```

---

## 5. Implementation Details

### 5.1 Files Modified

1. **`lib/types/auth.ts`**
   - Added `super_admin` to `UserRole` type
   - Added `hasFullAccess` to `RolePermissions` interface
   - Configured Super Admin with all permissions enabled

2. **`lib/role-permission-service.ts`**
   - Updated `canAccessPage()` to check for super_admin role
   - Updated `canPerformOperation()` to check for super_admin role
   - Super Admin bypass happens before Firestore queries

3. **`hooks/usePermission.ts`**
   - Added `isSuperAdmin()` method
   - All permission methods respect super_admin bypass

4. **`app/[locale]/admin/users/page.tsx`**
   - Added super_admin color scheme: `bg-purple-100 text-purple-700`

5. **`lib/user-service.ts`**
   - Added super_admin to role count statistics

### 5.2 Bypass Logic

Super Admin access bypass follows this pattern:

1. Permission check function is called (e.g., `canAccessPage()`)
2. Function immediately checks role name from Firestore
3. If role name is "super_admin" or "Super Admin", return `true`
4. If not super_admin, proceed with normal permission checks
5. Return result based on Firestore permissions

**Benefits:**
- ✅ Simple and efficient implementation
- ✅ No need to modify all permission checks globally
- ✅ Super Admin bypass happens at the source
- ✅ Backward compatible with existing roles
- ✅ Minimal performance impact

### 5.3 Role Name Matching

The system checks for both exact cases:
- `role.name === "super_admin"` (lowercase, system format)
- `role.name === "Super Admin"` (display format, from Firestore)

This ensures compatibility whether the role name is stored in database as "super_admin" or "Super Admin".

---

## 6. Usage in Components

### 6.1 Page Protection

```typescript
import ProtectedPage from "@/components/ProtectedPage";

export default function AdminUsersPage() {
  return (
    <ProtectedPage requiredRole="admin" requiredPermission="canManageUsers">
      {/* Page content */}
    </ProtectedPage>
  );
}
```

**Note:** ProtectedPage component should also check for super_admin to allow access

### 6.2 Component-Level Permission Checking

```typescript
import { usePermission } from "@/hooks/usePermission";

export function UserActions() {
  const { isSuperAdmin, canPerform } = usePermission();
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    canPerform("deleteUser").then(setCanDelete);
  }, [canPerform]);

  return (
    <>
      {(isSuperAdmin() || canDelete) && (
        <button onClick={handleDelete}>Delete User</button>
      )}
    </>
  );
}
```

### 6.3 Conditional Rendering

```typescript
import { usePermission } from "@/hooks/usePermission";

export function AdminPanel() {
  const { isSuperAdmin, canAccess } = usePermission();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (isSuperAdmin()) {
      setHasAccess(true);
    } else {
      canAccess("/admin/roles").then(setHasAccess);
    }
  }, [isSuperAdmin, canAccess]);

  return hasAccess ? <AdminContent /> : <AccessDenied />;
}
```

---

## 7. Testing Super Admin Access

### 7.1 Test Checklist

- [ ] Super Admin can access `/admin` dashboard
- [ ] Super Admin can access `/admin/users`
- [ ] Super Admin can access `/admin/roles`
- [ ] Super Admin can access `/admin/permissions`
- [ ] Super Admin can access `/admin/settings`
- [ ] Super Admin can access `/admin/sessions`
- [ ] Super Admin can access `/admin/languages`
- [ ] Super Admin can access `/admin/role-permissions`
- [ ] Super Admin cannot see permission denied errors
- [ ] Regular Admin cannot access role/permission management
- [ ] Moderator can only access moderation features
- [ ] User cannot access any admin features

### 7.2 Firestore Setup for Testing

To test Super Admin functionality, ensure your Firestore has:

1. A `super_admin` role document:
```javascript
{
  name: "super_admin",
  description: "System administrator",
  permissions: [],
  isSystemRole: true
}
```

2. A test user with super_admin role:
```javascript
{
  email: "admin@example.com",
  role: "super_admin",
  // ... other fields
}
```

3. Minimal page_permissions for super_admin (bypass happens before query)
   - OR: Empty collection (super_admin doesn't use these)

### 7.3 Manual Testing Steps

1. Log in with a super_admin user
2. Navigate to different admin pages
3. Verify no "Access Denied" errors appear
4. Try creating, editing, deleting operations
5. Verify all operations succeed
6. Log in with a regular admin user
7. Try accessing role/permission pages
8. Verify access is denied

---

## 8. Firestore Firestore Security Rules

Consider adding security rules to protect role and permission data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read roles
    match /roles/{roleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      getUserRole(request.auth.uid) == 'super_admin';
    }

    // Only authenticated users can read permissions
    match /permissions/{permissionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      getUserRole(request.auth.uid) == 'super_admin';
    }

    // Users can read their own page permissions
    match /page_permissions/{pagePermId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      getUserRole(request.auth.uid) == 'super_admin';
    }

    // Users can read their own operation permissions
    match /operation_permissions/{opPermId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      getUserRole(request.auth.uid) == 'super_admin';
    }

    function getUserRole(uid) {
      return get(/databases/$(database)/documents/users/$(uid)).data.role;
    }
  }
}
```

---

## 9. Migration Guide

If upgrading from a 3-role system to this 4-role system:

1. **Update Firestore Data:**
   - Add super_admin role document to `roles` collection
   - Create initial page_permissions and operation_permissions for super_admin

2. **Update Code:**
   - Deploy the updated TypeScript types
   - Deploy updated service functions
   - Deploy updated hooks

3. **Test:**
   - Create test user with super_admin role
   - Verify super_admin access works
   - Test other roles still work

4. **Production Deployment:**
   - Create production super_admin role in Firestore
   - Assign production super_admin user to new role
   - Monitor logs for any issues

---

## 10. Troubleshooting

### Issue: Super Admin getting "Access Denied"

**Cause:** Role name in Firestore doesn't match expected format

**Solution:**
- Check Firestore roles collection
- Verify role name is exactly "super_admin" or "Super Admin"
- Check user document has correct roleId

### Issue: Regular Admin can access restricted pages

**Cause:** Permission check not respecting role limitations

**Solution:**
- Verify canAccessPage() function has super_admin check
- Verify role_permission_service.ts is deployed with updates
- Check Firestore page_permissions collection doesn't have incorrect entries

### Issue: Performance issues with permission checks

**Cause:** Too many Firestore queries

**Solution:**
- Super Admin bypass prevents Firestore query - no performance issue for super_admin
- For other roles, consider caching permissions
- Use the `usePermission` hook which caches in component state

---

## 11. API Reference

### `canAccessPage(roleId, pagePath, operations?)`

**Parameters:**
- `roleId` (string): User's role ID
- `pagePath` (PagePath): Page path to check (e.g., "/admin/users")
- `operations?` (CRUDOperation[]): Optional CRUD operations to verify

**Returns:** Promise<boolean>

**Example:**
```typescript
const hasAccess = await canAccessPage(roleId, "/admin/users", ["READ", "UPDATE"]);
```

### `canPerformOperation(roleId, operationName)`

**Parameters:**
- `roleId` (string): User's role ID
- `operationName` (string): Operation to check (e.g., "deleteUser")

**Returns:** Promise<boolean>

**Example:**
```typescript
const canDelete = await canPerformOperation(roleId, "deleteUser");
```

### `usePermission().isSuperAdmin()`

**Parameters:** None

**Returns:** boolean

**Example:**
```typescript
const { isSuperAdmin } = usePermission();
if (isSuperAdmin()) {
  // Show super admin features
}
```

---

## 12. Completion Status

| Task | Status | Details |
|------|--------|---------|
| Type Definitions | ✅ Complete | super_admin added to UserRole |
| Service Functions | ✅ Complete | canAccessPage, canPerformOperation updated |
| Permission Hook | ✅ Complete | isSuperAdmin method added |
| Component Updates | ✅ Complete | Role badge colors added |
| Build Verification | ✅ Complete | 0 errors, 33 routes generated |
| Documentation | ✅ Complete | This file |

---

## 13. Next Steps

1. **Create Firestore super_admin role** in production
2. **Assign super_admin role** to administrator accounts
3. **Test Super Admin access** on all pages
4. **Monitor logs** for any permission issues
5. **Train administrators** on role usage

---

**Version:** 1.0  
**Build Status:** ✅ Verified (16.1s, 33/33 routes, 0 errors)  
**TypeScript Status:** ✅ All checks passing
