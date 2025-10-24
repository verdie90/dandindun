# Permission System - Quick Reference

## 5-Second Overview

**What:** Role-based permission system (Role × Page × CRUD)  
**Where:** `lib/role-permission-service.ts`, `hooks/usePermission`, `components/ProtectedPage.tsx`  
**Admin Panel:** `/admin/role-permissions`  

---

## Common Patterns

### Pattern 1: Protect Entire Page

```typescript
import { ProtectedPage } from "@/components/ProtectedPage";

export default function AdminUsersPage() {
  return (
    <ProtectedPage requiredPage="/admin/users" requiredOperations={["READ"]}>
      <UserTable />
    </ProtectedPage>
  );
}
```

### Pattern 2: Show/Hide Buttons Based on CRUD

```typescript
import { usePermission } from "@/hooks/usePermission";

export function UserActions() {
  const { canCreate, canUpdate, canDelete } = usePermission();

  return (
    <>
      {canCreate("/admin/users") && <button>Add User</button>}
      {canUpdate("/admin/users") && <button>Edit User</button>}
      {canDelete("/admin/users") && <button>Delete User</button>}
    </>
  );
}
```

### Pattern 3: Check Special Operation

```typescript
import { usePermission } from "@/hooks/usePermission";

export function BanUserButton({ userId }) {
  const { isOperationAllowed } = usePermission();

  if (!isOperationAllowed("banUser")) {
    return <DisabledButton>Ban User</DisabledButton>;
  }

  return <button onClick={() => banUser(userId)}>Ban User</button>;
}
```

### Pattern 4: Guard API Route

```typescript
// app/api/users/[id]/delete/route.ts
import { canPerformOperation } from "@/lib/role-permission-service";

export async function POST(req, { params }) {
  const user = getAuthUser(req); // Your auth logic
  
  if (!await canPerformOperation(user.roleId, "deleteUser")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return deleteUser(params.id);
}
```

---

## Default Permissions

| Role | Pages | Can Delete | Can Ban | Can Reset Pwd |
|------|-------|-----------|--------|--------------|
| **Admin** | All | ✅ Yes | ✅ Yes | ✅ Yes |
| **Moderator** | Dashboard, Users (read-only) | ❌ No | ✅ Yes | ❌ No |
| **User** | Dashboard, Profile | ❌ No | ❌ No | ❌ No |

---

## API Quick Ref

```typescript
// Check if can do CRUD on page (SYNC)
canCreate(page)     // boolean
canRead(page)       // boolean
canUpdate(page)     // boolean
canDelete(page)     // boolean

// Check if can do special operation (SYNC)
isOperationAllowed(operationName)  // boolean

// Check permissions async
await canAccess(page, operations)        // boolean
await canPerform(operationName)          // boolean

// Set permissions
await setPagePermission(roleId, page, operations)
await setOperationPermission(roleId, operationName, allowed)

// Bulk operations
await bulkSetPagePermissions(roleId, [...])
await bulkSetOperationPermissions(roleId, [...])

// Get data
await getPagePermissionsForRole(roleId)
await getOperationPermissionsForRole(roleId)
await getRolePermissionMatrix(roleId)
```

---

## Pages with Permission Control

```
/dashboard
/admin
/admin/users          ← Important: user management
/admin/roles          ← Important: role management
/admin/permissions    ← View existing permissions
/admin/role-permissions  ← ADMIN UI: Manage permissions
/admin/settings
/admin/logs
/profile
```

---

## CRUD Operations

```
CREATE  - Add new records
READ    - View records
UPDATE  - Modify records
DELETE  - Remove records
```

---

## Special Operations

```
deleteUser       - Delete a user
editProfile      - Edit user profile
resetPassword    - Reset user password
banUser          - Ban user account
unbanUser        - Unban user account
changeRole       - Change user role
exportData       - Export data
viewLogs         - View system logs
```

---

## Admin Panel

**URL:** `/admin/role-permissions`

**What you can do:**
1. View permission matrix for all roles
2. Click "Configure" to edit a role
3. Toggle CRUD operations per page
4. Toggle special operations
5. Save changes

**Save button** will update all permissions at once.

---

## Permission Loading

```typescript
const { loading, error } = usePermission();

if (loading) return <Spinner />;
if (error) return <Error message={error} />;
```

---

## Examples by Use Case

### Use Case: Admin deletes a user

**UI Level:**
```typescript
{canDelete("/admin/users") && (
  <button onClick={() => deleteUser(id)}>Delete</button>
)}
```

**API Level:**
```typescript
if (!await canPerformOperation(user.roleId, "deleteUser")) {
  return forbidden();
}
```

### Use Case: Moderator can view but not edit roles

**UI Level:**
```typescript
<ProtectedPage requiredPage="/admin/roles" requiredOperations={["READ"]}>
  <RolesTable readOnly={!canUpdate("/admin/roles")} />
</ProtectedPage>
```

### Use Case: User can only edit their own profile

**UI Level:**
```typescript
export function ProfilePage({ userId }) {
  const { user, canUpdate } = usePermission();
  
  const canEdit = canUpdate("/profile") && user.id === userId;
  
  return <ProfileForm editable={canEdit} />;
}
```

---

## Debugging Permissions

```typescript
// Log all permissions for current user
const { pagePermissions, operationPermissions } = usePermission();
console.log("Pages:", pagePermissions);
console.log("Operations:", operationPermissions);

// Check specific permission
const { canDelete } = usePermission();
console.log("Can delete users:", canDelete("/admin/users"));

// Check operation
const { isOperationAllowed } = usePermission();
console.log("Can ban users:", isOperationAllowed("banUser"));
```

---

## Initializing Permissions

```typescript
import { initializeDefaultPagePermissions } from "@/lib/role-permission-service";

// Run once during setup
await initializeDefaultPagePermissions();
```

---

## Type Definitions

```typescript
type CRUDOperation = "CREATE" | "READ" | "UPDATE" | "DELETE";
type PagePath = string;  // e.g., "/admin/users"

interface PagePermission {
  roleId: string;
  pagePath: PagePath;
  operations: CRUDOperation[];
  canAccess: boolean;
}

interface OperationPermission {
  roleId: string;
  operationName: string;
  allowed: boolean;
}
```

---

## Common Mistakes

❌ **Don't:** Check UI permission only
```typescript
// BAD - API isn't checking!
if (canDelete("/admin/users")) {
  await deleteUser();  // Anyone calling API can bypass this
}
```

✅ **Do:** Check both UI and API
```typescript
// GOOD
if (canDelete("/admin/users")) {
  const response = await deleteUser();  // API also checks!
}
```

---

❌ **Don't:** Forget to initialize
```typescript
// BAD - no permissions configured
<ProtectedPage requiredPage="/admin/users">...</ProtectedPage>
```

✅ **Do:** Initialize permissions first
```typescript
// GOOD - in your setup/main file
await initializeDefaultPagePermissions();
```

---

❌ **Don't:** Mix permission checks
```typescript
// CONFUSING
if (canCreate) {
  if (await canAccess()) {
    // Different data might be in cache vs DB
  }
}
```

✅ **Do:** Choose one pattern
```typescript
// GOOD - consistent
const { canCreate } = usePermission();  // Use cache
if (canCreate("/admin/users")) { ... }

// OR
const allowed = await canAccess("/admin/users", ["CREATE"]);  // Fresh check
```

---

## Next Steps

1. **Wrap Pages:** Add `<ProtectedPage>` to protected routes
2. **Add Buttons:** Use `usePermission()` to show/hide buttons
3. **Guard APIs:** Check permissions in API routes
4. **Test:** Use admin panel to test permission changes
5. **Deploy:** System is production-ready

---

## Need Help?

- Check full docs: `docs/PERMISSION_SYSTEM.md`
- See integration examples: Search for `usePermission` usage
- Admin panel: `/admin/role-permissions`
- Code: `lib/role-permission-service.ts`, `hooks/usePermission.ts`
