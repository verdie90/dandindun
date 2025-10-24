# Permission Management System - Comprehensive Guide

## Overview

A complete role-based permission system that controls access based on:
- **Role** (admin, moderator, user)
- **Page** (URLs and routes)
- **CRUD Operations** (Create, Read, Update, Delete)

---

## System Architecture

### Collections

1. **roles** - Role definitions
2. **permissions** - Legacy permissions (for backward compatibility)
3. **page_permissions** - Page-based access control
4. **operation_permissions** - Operation-level permissions

### Permission Types

#### 1. Page-Based Permissions
Control which CRUD operations are allowed on each page.

```typescript
// Format: role + page + operations
{
  roleId: "admin",
  pagePath: "/admin/users",
  operations: ["CREATE", "READ", "UPDATE", "DELETE"],
  canAccess: true
}
```

#### 2. Operation-Based Permissions
Control access to specific operations.

```typescript
{
  roleId: "moderator",
  operationName: "deleteUser",
  allowed: false
}
```

---

## Core Functions

### Page Permission Functions

#### `setPagePermission(roleId, pagePath, operations)`
Set page access for a role.

```typescript
await setPagePermission(
  "admin",
  "/admin/users",
  ["CREATE", "READ", "UPDATE", "DELETE"]
);
```

#### `getPagePermissionsForRole(roleId)`
Get all page permissions for a role.

```typescript
const permissions = await getPagePermissionsForRole("admin");
// Returns: PagePermission[]
```

#### `canAccessPage(roleId, pagePath, operations?)`
Check if role can access page with specific operations.

```typescript
const canAccess = await canAccessPage("admin", "/admin/users", ["DELETE"]);
// Returns: boolean
```

#### `getPagePermissionMatrix(roleId?)`
Get permission matrix view for one or all roles.

```typescript
const matrix = await getPagePermissionMatrix("admin");
// Returns structured permission data
```

### Operation Permission Functions

#### `setOperationPermission(roleId, operationName, allowed)`
Set operation permission for a role.

```typescript
await setOperationPermission("admin", "deleteUser", true);
```

#### `getOperationPermissionsForRole(roleId)`
Get all operation permissions for a role.

```typescript
const ops = await getOperationPermissionsForRole("moderator");
```

#### `canPerformOperation(roleId, operationName)`
Check if role can perform operation.

```typescript
const canDelete = await canPerformOperation("user", "deleteUser");
```

### Bulk Functions

#### `bulkSetPagePermissions(roleId, pagePermissions)`
Set multiple page permissions at once.

```typescript
await bulkSetPagePermissions("admin", [
  { pagePath: "/admin/users", operations: ["CREATE", "READ", "UPDATE", "DELETE"] },
  { pagePath: "/admin/roles", operations: ["READ", "UPDATE"] }
]);
```

#### `bulkSetOperationPermissions(roleId, operationPermissions)`
Set multiple operation permissions at once.

```typescript
await bulkSetOperationPermissions("moderator", [
  { operationName: "deleteUser", allowed: false },
  { operationName: "banUser", allowed: true }
]);
```

---

## Using Permission Hooks

### `usePermission()` Hook

Main hook for permission checking.

```typescript
const {
  // Methods
  check,              // Legacy method
  checkRole,          // Check if user has role
  canAccess,          // Async: check page access
  canPerform,         // Async: check operation
  
  // CRUD checks (synchronous)
  canCreate,          // Check if can CREATE
  canRead,            // Check if can READ
  canUpdate,          // Check if can UPDATE
  canDelete,          // Check if can DELETE
  
  // General checks
  hasPageAccess,      // Check if has any access to page
  isOperationAllowed, // Check operation permission
  
  // Data
  pagePermissions,
  operationPermissions,
  
  // State
  loading,
  error,
  user,
  isAuthenticated
} = usePermission();
```

### Example Usage

```typescript
"use client";

import { usePermission } from "@/hooks/usePermission";

export function UserManagement() {
  const { canCreate, canUpdate, canDelete, hasPageAccess } = usePermission();

  if (!hasPageAccess("/admin/users")) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      {canCreate("/admin/users") && <button>Create User</button>}
      {canUpdate("/admin/users") && <button>Edit User</button>}
      {canDelete("/admin/users") && <button>Delete User</button>}
    </div>
  );
}
```

---

## Protected Page Components

### `ProtectedPage` Component

Wrapper component to protect entire pages.

```typescript
import { ProtectedPage } from "@/components/ProtectedPage";

export default function AdminUsersPage() {
  return (
    <ProtectedPage
      requiredPage="/admin/users"
      requiredOperations={["READ"]}
    >
      <YourPageContent />
    </ProtectedPage>
  );
}
```

### `useRequirePageAccess` Hook

Hook to redirect if no access.

```typescript
export default function ProtectedPage() {
  const { hasAccess, loading } = useRequirePageAccess("/admin/users", ["READ"]);

  if (loading) return <LoadingSpinner />;
  if (!hasAccess) return null; // Will redirect

  return <PageContent />;
}
```

---

## Default Roles & Permissions

### Admin Role
Full access to all pages and operations.

```typescript
Pages: [
  "/dashboard" -> ["READ"],
  "/admin" -> ["READ"],
  "/admin/users" -> ["CREATE", "READ", "UPDATE", "DELETE"],
  "/admin/roles" -> ["CREATE", "READ", "UPDATE", "DELETE"],
  "/admin/permissions" -> ["CREATE", "READ", "UPDATE", "DELETE"],
  "/admin/settings" -> ["READ", "UPDATE"],
  "/admin/logs" -> ["READ"],
  "/profile" -> ["READ", "UPDATE"]
]
```

### Moderator Role
Limited admin access.

```typescript
Pages: [
  "/dashboard" -> ["READ"],
  "/admin" -> ["READ"],
  "/admin/users" -> ["READ"],
  "/profile" -> ["READ", "UPDATE"]
]
```

### User Role
Basic access only.

```typescript
Pages: [
  "/dashboard" -> ["READ"],
  "/profile" -> ["READ", "UPDATE"]
]
```

---

## Managing Permissions

### Via Admin UI

Visit `/admin/role-permissions` to manage permissions visually:

1. See permission matrix for all roles
2. Click "Configure" on a role
3. Set page access (CRUD operations)
4. Set special operations
5. Save changes

### Programmatically

```typescript
import {
  bulkSetPagePermissions,
  bulkSetOperationPermissions
} from "@/lib/role-permission-service";

// Set permissions for moderator
await bulkSetPagePermissions("moderator", [
  { pagePath: "/admin/users", operations: ["READ"] },
  { pagePath: "/admin/roles", operations: ["READ"] }
]);

await bulkSetOperationPermissions("moderator", [
  { operationName: "deleteUser", allowed: false },
  { operationName: "banUser", allowed: true }
]);
```

---

## Permission Checking in Components

### Check Page Access

```typescript
import { usePermission } from "@/hooks/usePermission";

export function UserTable() {
  const { canCreate, canUpdate, canDelete } = usePermission();

  return (
    <Table>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>
              {canUpdate("/admin/users") && (
                <button onClick={() => editUser(user)}>Edit</button>
              )}
              {canDelete("/admin/users") && (
                <button onClick={() => deleteUser(user)}>Delete</button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Check Operation Permission

```typescript
import { usePermission } from "@/hooks/usePermission";

export function UserActions() {
  const { isOperationAllowed } = usePermission();

  const handleDelete = async (userId: string) => {
    if (!isOperationAllowed("deleteUser")) {
      alert("You don't have permission to delete users");
      return;
    }
    
    await deleteUser(userId);
  };

  return (
    <button 
      onClick={() => handleDelete(user.id)}
      disabled={!isOperationAllowed("deleteUser")}
    >
      Delete
    </button>
  );
}
```

---

## Server-Side Permission Checks

### In API Routes

```typescript
// app/api/users/route.ts

import { getAuth } from "@/lib/auth-service";
import { canPerformOperation } from "@/lib/role-permission-service";

export async function DELETE(req: Request) {
  const user = getAuth(req);
  
  if (!await canPerformOperation(user.role, "deleteUser")) {
    return Response.json(
      { error: "Not authorized" },
      { status: 403 }
    );
  }

  // Delete user...
}
```

---

## Permission Matrix Structure

### Role Permission Matrix

```typescript
interface RolePermissionMatrix {
  roleId: string;
  roleName: string;
  
  // Page -> CRUD operations
  pagePermissions: {
    "/admin/users": ["CREATE", "READ", "UPDATE", "DELETE"],
    "/admin/roles": ["READ", "UPDATE"],
    ...
  },
  
  // Operation -> allowed boolean
  operationPermissions: {
    "deleteUser": true,
    "banUser": true,
    "resetPassword": false,
    ...
  }
}
```

---

## Complete Example: User Management

```typescript
"use client";

import { usePermission } from "@/hooks/usePermission";

export function UserManagement() {
  const {
    loading,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasPageAccess,
    isOperationAllowed
  } = usePermission();

  // Check page access
  if (!hasPageAccess("/admin/users")) {
    return <AccessDenied />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>User Management</h1>
      
      {/* Create button */}
      {canCreate("/admin/users") && (
        <button onClick={openCreateDialog}>+ Create User</button>
      )}

      {/* User table */}
      {canRead("/admin/users") && (
        <UserTable
          onEdit={canUpdate("/admin/users") ? editUser : null}
          onDelete={canDelete("/admin/users") && isOperationAllowed("deleteUser")
            ? deleteUser 
            : null}
        />
      )}

      {/* Import users */}
      {isOperationAllowed("importUsers") && (
        <button onClick={openImportDialog}>Import Users</button>
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Always Check Permissions

```typescript
// ✅ Good
if (canDelete("/admin/users")) {
  return <DeleteButton />;
}

// ❌ Bad - no permission check
return <DeleteButton />;
```

### 2. Check Before API Calls

```typescript
// ✅ Good
const handleDelete = async (id) => {
  if (!isOperationAllowed("deleteUser")) {
    throw new Error("Not authorized");
  }
  await deleteUser(id);
};

// ❌ Bad - no pre-check
const handleDelete = async (id) => {
  await deleteUser(id); // API should check, but UI should too
};
```

### 3. Use Protected Components

```typescript
// ✅ Good
<ProtectedPage requiredPage="/admin/users" requiredOperations={["READ"]}>
  <UserContent />
</ProtectedPage>

// ❌ Bad - no protection
<UserContent />
```

### 4. Separate UI & Logic Permissions

```typescript
// ✅ Good - show/hide based on permissions
const { canDelete } = usePermission();

if (!canDelete("/admin/users")) {
  return <DisabledDeleteButton />;
}

// ✅ Good - also verify in handler
const handleDelete = async () => {
  if (!await canPerformOperation("deleteUser")) {
    alert("Not authorized");
    return;
  }
  await deleteUser();
};

// ❌ Bad - only UI check, no server validation
```

---

## Common Issues & Solutions

### Issue: Permissions not loading

**Solution**: Check if user is authenticated and role is set.

```typescript
const { loading, user } = usePermission();

if (loading) return <Spinner />;
if (!user) return <LoginRequired />;
```

### Issue: Permission check always returns false

**Solution**: Ensure page/operation exists in database.

```typescript
// Initialize default permissions first
await initializeDefaultPagePermissions();
```

### Issue: CRUD shortcuts don't work immediately

**Solution**: These are cached. Use async `canAccess()` for fresh checks.

```typescript
// Cached (from last load)
const cached = canCreate("/admin/users");

// Fresh check
const fresh = await canAccess("/admin/users", ["CREATE"]);
```

---

## Integration Checklist

- [ ] Initialize default permissions: `initializeDefaultPagePermissions()`
- [ ] Wrap protected pages with `<ProtectedPage />`
- [ ] Add permission checks in components using `usePermission()`
- [ ] Verify server-side in API routes
- [ ] Set up admin UI at `/admin/role-permissions`
- [ ] Test permission changes in admin panel
- [ ] Document custom permissions for your app
- [ ] Set up monitoring for permission denials

---

## API Reference Summary

| Function | Purpose | Returns |
|----------|---------|---------|
| `setPagePermission()` | Set page access | void |
| `getPagePermissionsForRole()` | Get page perms | PagePermission[] |
| `canAccessPage()` | Check page access | boolean |
| `getPagePermissionMatrix()` | Get matrix | PagePermissionMatrix[] |
| `setOperationPermission()` | Set op perm | void |
| `getOperationPermissionsForRole()` | Get op perms | OperationPermission[] |
| `canPerformOperation()` | Check op perm | boolean |
| `bulkSetPagePermissions()` | Bulk set pages | void |
| `bulkSetOperationPermissions()` | Bulk set ops | void |
| `getRolePermissionMatrix()` | Get full matrix | RolePermissionMatrix |

---

## Supported Pages

```
/dashboard
/admin
/admin/users
/admin/roles
/admin/permissions
/admin/role-permissions
/admin/settings
/admin/logs
/profile
```

---

**System Status:** ✅ Production Ready
