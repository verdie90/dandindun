# Permission System Integration Guide

## Overview

This guide walks through integrating the permission system into your existing admin pages.

---

## Step 1: Protect Admin Pages with ProtectedPage

### Template

```typescript
"use client";

import { ProtectedPage } from "@/components/ProtectedPage";
import { PageTitle } from "@/components/PageTitle";

export default function AdminPageName() {
  return (
    <ProtectedPage 
      requiredPage="/admin/page-name"
      requiredOperations={["READ"]}
    >
      <div className="space-y-6">
        <PageTitle title="Page Name" />
        
        {/* Your existing content here */}
      </div>
    </ProtectedPage>
  );
}
```

### Pages to Protect

**1. `/admin/users`** - User Management
```typescript
// app/[locale]/admin/users/page.tsx
<ProtectedPage 
  requiredPage="/admin/users"
  requiredOperations={["READ"]}
>
  {/* content */}
</ProtectedPage>
```

**2. `/admin/roles`** - Role Management
```typescript
// app/[locale]/admin/roles/page.tsx
<ProtectedPage 
  requiredPage="/admin/roles"
  requiredOperations={["READ"]}
>
  {/* content */}
</ProtectedPage>
```

**3. `/admin/permissions`** - Permission Viewer
```typescript
// app/[locale]/admin/permissions/page.tsx
<ProtectedPage 
  requiredPage="/admin/permissions"
  requiredOperations={["READ"]}
>
  {/* content */}
</ProtectedPage>
```

**4. `/admin/settings`** - Settings
```typescript
// app/[locale]/admin/settings/page.tsx
<ProtectedPage 
  requiredPage="/admin/settings"
  requiredOperations={["READ"]}
>
  {/* content */}
</ProtectedPage>
```

**5. `/admin/logs`** - System Logs
```typescript
// app/[locale]/admin/logs/page.tsx
<ProtectedPage 
  requiredPage="/admin/logs"
  requiredOperations={["READ"]}
>
  {/* content */}
</ProtectedPage>
```

---

## Step 2: Add Permission Checks to Action Buttons

### Pattern: Create/Read/Update/Delete Buttons

```typescript
"use client";

import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";

export function DataTable({ data }) {
  const { canCreate, canRead, canUpdate, canDelete } = usePermission();

  // Column with action buttons
  const columns = [
    // ... other columns
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {canRead("/admin/users") && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => viewItem(row)}
            >
              View
            </Button>
          )}
          
          {canUpdate("/admin/users") && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editItem(row)}
            >
              Edit
            </Button>
          )}
          
          {canDelete("/admin/users") && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteItem(row)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {canCreate("/admin/users") && (
        <Button onClick={() => openCreateDialog()}>
          + Create New
        </Button>
      )}
      
      <DataTable columns={columns} data={data} />
    </div>
  );
}
```

---

## Step 3: Add Permissions to CRUD Operations

### Example: Delete User Operation

**File:** `lib/admin-service.ts`

```typescript
// Before: No permission check
export async function deleteUser(userId: string) {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(userRef);
}

// After: Add permission check
import { canPerformOperation } from "./role-permission-service";

export async function deleteUser(userId: string, userRole?: string) {
  // Check permission if role provided
  if (userRole && !await canPerformOperation(userRole, "deleteUser")) {
    throw new Error("Not authorized to delete users");
  }

  const userRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(userRef);
}
```

**File:** `app/api/users/[id]/delete/route.ts`

```typescript
import { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth-service";
import { deleteUser } from "@/lib/admin-service";
import { canPerformOperation } from "@/lib/role-permission-service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const authUser = await getAuth(req);
    if (!authUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    if (!await canPerformOperation(authUser.roleId, "deleteUser")) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete user
    await deleteUser(params.id, authUser.roleId);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Step 4: Add Special Operation Guards

### Example: Ban User Operation

```typescript
"use client";

import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";

export function UserActions({ user }) {
  const { isOperationAllowed } = usePermission();
  
  const canBan = isOperationAllowed("banUser");
  const canReset = isOperationAllowed("resetPassword");
  const canChangeRole = isOperationAllowed("changeRole");

  return (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        size="sm"
        disabled={!canBan}
        title={!canBan ? "You don't have permission to ban users" : ""}
        onClick={() => banUser(user.id)}
      >
        Ban User
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={!canReset}
        title={!canReset ? "You don't have permission to reset passwords" : ""}
        onClick={() => resetPassword(user.id)}
      >
        Reset Password
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={!canChangeRole}
        title={!canChangeRole ? "You don't have permission to change roles" : ""}
        onClick={() => openRoleDialog(user)}
      >
        Change Role
      </Button>
    </div>
  );
}
```

---

## Step 5: Bulk Permission Operations

### Setting Permissions for a New Role

```typescript
import {
  bulkSetPagePermissions,
  bulkSetOperationPermissions
} from "@/lib/role-permission-service";

async function setupModeratorRole() {
  const roleId = "moderator";

  // Set page permissions
  await bulkSetPagePermissions(roleId, [
    { pagePath: "/dashboard", operations: ["READ"] },
    { pagePath: "/admin", operations: ["READ"] },
    { pagePath: "/admin/users", operations: ["READ"] },
    { pagePath: "/admin/logs", operations: ["READ"] },
    { pagePath: "/profile", operations: ["READ", "UPDATE"] },
  ]);

  // Set operation permissions
  await bulkSetOperationPermissions(roleId, [
    { operationName: "deleteUser", allowed: false },
    { operationName: "editProfile", allowed: true },
    { operationName: "resetPassword", allowed: true },
    { operationName: "banUser", allowed: true },
    { operationName: "unbanUser", allowed: true },
    { operationName: "changeRole", allowed: false },
    { operationName: "exportData", allowed: false },
    { operationName: "viewLogs", allowed: true },
  ]);

  console.log("Moderator role configured");
}
```

---

## Integration Checklist

### Phase 1: Protect Pages
- [ ] Wrap `/admin/users` with `<ProtectedPage>`
- [ ] Wrap `/admin/roles` with `<ProtectedPage>`
- [ ] Wrap `/admin/permissions` with `<ProtectedPage>`
- [ ] Wrap `/admin/settings` with `<ProtectedPage>`
- [ ] Wrap `/admin/logs` with `<ProtectedPage>`

### Phase 2: Add CRUD Button Guards
- [ ] Add `canCreate` check to create buttons
- [ ] Add `canRead` check to view buttons
- [ ] Add `canUpdate` check to edit buttons
- [ ] Add `canDelete` check to delete buttons

### Phase 3: Add Operation Guards
- [ ] Add `isOperationAllowed("deleteUser")` checks
- [ ] Add `isOperationAllowed("banUser")` checks
- [ ] Add `isOperationAllowed("resetPassword")` checks
- [ ] Add `isOperationAllowed("changeRole")` checks

### Phase 4: Server-Side Protection
- [ ] Check permissions in `/api/users/*` endpoints
- [ ] Check permissions in `/api/roles/*` endpoints
- [ ] Check permissions in `/api/admin/*` endpoints

### Phase 5: Testing
- [ ] Test as Admin (should see all options)
- [ ] Test as Moderator (limited options)
- [ ] Test as User (almost no options)
- [ ] Test permission changes in admin panel
- [ ] Verify redirects work

---

## Quick Implementation Example

### Before Integration
```typescript
// ❌ No permission checks
export default function UsersPage() {
  return (
    <div>
      <button onClick={createUser}>Create</button>
      <UserTable onEdit={editUser} onDelete={deleteUser} />
    </div>
  );
}
```

### After Integration
```typescript
"use client";

import { ProtectedPage } from "@/components/ProtectedPage";
import { usePermission } from "@/hooks/usePermission";

export default function UsersPage() {
  const { canCreate } = usePermission();

  return (
    <ProtectedPage 
      requiredPage="/admin/users"
      requiredOperations={["READ"]}
    >
      <div>
        {canCreate("/admin/users") && (
          <button onClick={createUser}>Create</button>
        )}
        <UserTable />
      </div>
    </ProtectedPage>
  );
}
```

---

## Permission Levels Reference

### Admin Role (Full Access)
```
✅ Create, Read, Update, Delete on all pages
✅ All special operations (ban, reset, etc.)
✅ View admin panels and settings
✅ Manage permissions and roles
```

### Moderator Role (Limited Access)
```
✅ Read dashboard and users
✅ Ban/Unban users
✅ Reset passwords
✅ Edit own profile
❌ Create/Delete users
❌ Manage roles or permissions
```

### User Role (Minimal Access)
```
✅ Read dashboard
✅ Edit own profile
❌ Any admin functions
❌ Any special operations
```

---

## Testing Permission Changes

1. Go to `/admin/role-permissions`
2. Click "Configure" on a role
3. Toggle permissions on/off
4. Click "Save"
5. Go to the page and verify buttons appear/disappear

---

## Debugging

### Check Current User Role
```typescript
const { user } = usePermission();
console.log("Current role:", user?.roleId);
```

### Check All Permissions
```typescript
const { pagePermissions, operationPermissions } = usePermission();
console.log("Page perms:", pagePermissions);
console.log("Operation perms:", operationPermissions);
```

### Check Specific Permission
```typescript
const { canDelete } = usePermission();
console.log("Can delete users:", canDelete("/admin/users"));
```

---

## Common Implementation Patterns

### Pattern 1: Conditional Rendering
```typescript
{canCreate("/admin/users") && <CreateButton />}
```

### Pattern 2: Disabled Buttons with Tooltips
```typescript
<Button 
  disabled={!canDelete("/admin/users")}
  title={!canDelete("/admin/users") ? "No permission" : ""}
>
  Delete
</Button>
```

### Pattern 3: Role-Based UI Sections
```typescript
{user?.roleId === "admin" && <AdminPanel />}
{["admin", "moderator"].includes(user?.roleId) && <ModeratorTools />}
```

### Pattern 4: API Error Handling
```typescript
try {
  await deleteUser(id);
} catch (error) {
  if (error.message.includes("Not authorized")) {
    alert("You don't have permission to delete this user");
  }
}
```

---

## Next Steps

1. **Review:** Look at each admin page
2. **Wrap:** Add `<ProtectedPage>` wrapper
3. **Guard:** Add `usePermission` checks to buttons
4. **Test:** Verify with different roles
5. **Deploy:** Push to production

---

## Need Help?

- Full docs: `docs/PERMISSION_SYSTEM.md`
- Quick ref: `docs/PERMISSION_QUICK_REFERENCE.md`
- Admin panel: `/admin/role-permissions`
- Code: `lib/role-permission-service.ts`
