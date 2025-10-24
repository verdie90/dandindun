# CRUD Operations Documentation

## Overview

This document outlines all CRUD (Create, Read, Update, Delete) operations available for user management in the admin system.

---

## CREATE Operations

### User Registration
Users are created through the authentication system. Admins cannot directly create users through the admin interface.

**File:** `lib/auth-service.ts`
```typescript
// User creates account through registration
const registerUser = async (email, password, name) => {
  // Handled in auth flow
};
```

---

## READ Operations

### 1. Get All Users
Fetch all users with management data including status, login info, and role.

**Function:** `getAllUsersForAdmin()`
**Location:** `lib/admin-service.ts`

```typescript
const users = await getAllUsersForAdmin();
// Returns: UserManagementData[]
// Fields: id, email, name, role, status, lastLogin, loginCount, createdAt, updatedAt
```

### 2. Get All Users (Simple)
Get basic user list from user-service.

**Function:** `getAllUsers()`
**Location:** `lib/user-service.ts`

```typescript
const users = await getAllUsers();
// Returns: User[]
```

### 3. Search Users
Search users by name or email.

**Function:** `searchUsersForAdmin(searchTerm)`
**Location:** `lib/admin-service.ts`

```typescript
const results = await searchUsersForAdmin("john");
// Returns: UserManagementData[] matching name or email
```

### 4. Advanced Search with Filters
Search users with multiple filter criteria.

**Function:** `advancedSearchUsers(filters)`
**Location:** `lib/admin-service.ts`

```typescript
const results = await advancedSearchUsers({
  searchTerm: "john",
  role: "admin",
  status: "active",
  createdAfter: new Date("2024-01-01"),
  createdBefore: new Date("2024-12-31"),
  loginAfter: new Date("2024-10-01")
});
```

**Filter Options:**
- `searchTerm`: Search by name or email (string)
- `role`: Filter by role (UserRole: "user" | "moderator" | "admin")
- `status`: Filter by status ("active" | "inactive" | "banned" | "deleted")
- `createdAfter`: Users created after this date (Date)
- `createdBefore`: Users created before this date (Date)
- `loginAfter`: Users with last login after this date (Date)
- `loginBefore`: Users with last login before this date (Date)

### 5. Get Users by Status
Fetch all users with a specific status.

**Function:** `getUsersByStatus(status)`
**Location:** `lib/admin-service.ts`

```typescript
const activeUsers = await getUsersByStatus("active");
const bannedUsers = await getUsersByStatus("banned");
```

### 6. Get Users by Role
Fetch all users with a specific role.

**Function:** `getUsersByRole(role)`
**Location:** `lib/admin-service.ts`

```typescript
const admins = await getUsersByRole("admin");
const moderators = await getUsersByRole("moderator");
```

### 7. Get User Statistics
Get aggregated statistics about users.

**Function:** `getUserStatsForAdmin()`
**Location:** `lib/admin-service.ts`

```typescript
const stats = await getUserStatsForAdmin();
// Returns: {
//   total: number,
//   active: number,
//   inactive: number,
//   banned: number,
//   deleted: number,
//   byRole: { admin: number, moderator: number, user: number }
// }
```

### 8. Get User Profile
Fetch detailed user profile information.

**Function:** `getUserProfile(userId)`
**Location:** `lib/user-service.ts`

```typescript
const profile = await getUserProfile(userId);
// Returns: { bio, avatar, phone, location, website, preferences, updatedAt }
```

### 9. Get User by Email
Find a user by email address.

**Function:** `getUserByEmail(email)`
**Location:** `lib/user-service.ts`

```typescript
const user = await getUserByEmail("user@example.com");
// Returns: User | null
```

### 10. Get Basic User Info
Quick access to user name and email.

**Function:** `getUserBasicInfo(userId)`
**Location:** `lib/user-service.ts`

```typescript
const info = await getUserBasicInfo(userId);
// Returns: { id, name, email } | null
```

### 11. Get Admin Audit Logs
Fetch audit logs of admin actions.

**Function:** `getAdminAuditLogs(adminId?, limit?)`
**Location:** `lib/admin-service.ts`

```typescript
const logs = await getAdminAuditLogs();
const adminLogs = await getAdminAuditLogs(adminId, 50);
// Returns: AdminAuditLog[]
```

### 12. Get User Activity Logs
Fetch activity logs for a specific user.

**Function:** `getUserActivityLogs(userId, limit?)`
**Location:** `lib/user-service.ts`

```typescript
const activities = await getUserActivityLogs(userId, 100);
```

### 13. Get Recent Users
Fetch users created in the last N days.

**Function:** `getRecentUsers(days?)`
**Location:** `lib/user-service.ts`

```typescript
const newUsers = await getRecentUsers(7); // Last 7 days
const thisMonth = await getRecentUsers(30); // Last 30 days
```

### 14. Get User Counts
Get various user count statistics.

**Functions:**
- `getTotalUserCount()` - Total users
- `getActiveUsersCount()` - Active users only

**Location:** `lib/user-service.ts`

```typescript
const total = await getTotalUserCount();
const active = await getActiveUsersCount();
```

### 15. Check User Existence
Verify if a user exists.

**Function:** `userExists(userId)`
**Location:** `lib/user-service.ts`

```typescript
const exists = await userExists(userId);
// Returns: boolean
```

---

## UPDATE Operations

### 1. Update User Role
Change a user's role with audit logging.

**Function:** `updateUserRoleAsAdmin(adminId, userId, newRole, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
await updateUserRoleAsAdmin(adminId, userId, "moderator", "Promoted for good conduct");
// Role options: "user" | "moderator" | "admin"
```

### 2. Update User Role by Name
Update role using role name from Firestore.

**Function:** `updateUserRoleByName(adminId, userId, roleName, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
await updateUserRoleByName(adminId, userId, "super admin", "Custom role assignment");
```

### 3. Update User Info
Update name and/or email.

**Function:** `updateUserInfo(userId, data)`
**Location:** `lib/user-service.ts`

```typescript
await updateUserInfo(userId, {
  name: "New Name",
  email: "newemail@example.com"
});
```

### 4. Update User Fields
Update any user fields.

**Function:** `updateUserFields(userId, fields)`
**Location:** `lib/user-service.ts`

```typescript
await updateUserFields(userId, {
  name: "John Doe",
  role: "admin",
  status: "active"
});
```

### 5. Update User Profile
Update extended profile information.

**Function:** `updateUserProfile(userId, profileData)`
**Location:** `lib/user-service.ts`

```typescript
await updateUserProfile(userId, {
  bio: "Software Developer",
  avatar: "https://...",
  phone: "+1234567890",
  location: "New York",
  website: "https://example.com",
  preferences: { theme: "dark", language: "en" }
});
```

### 6. Change User Password
User changes their own password (requires old password).

**Function:** `changeUserPassword(userId, oldPassword, newPassword)`
**Location:** `lib/user-service.ts`

```typescript
await changeUserPassword(userId, "oldPass123", "newPass456");
// Throws error if old password incorrect
```

### 7. Admin Reset Password
Admin resets user password without verification.

**Function:** `adminResetPassword(userId, newPassword)`
**Location:** `lib/user-service.ts`

```typescript
await adminResetPassword(userId, "tempPassword123");
```

### 8. Deactivate User Account
Set user status to inactive.

**Function:** `deactivateUserAsAdmin(adminId, userId, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
await deactivateUserAsAdmin(adminId, userId, "Account suspended");
```

### 9. Activate User Account
Reactivate an inactive user.

**Function:** `activateUserAsAdmin(adminId, userId, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
await activateUserAsAdmin(adminId, userId, "Appeal approved");
```

### 10. Ban User Account
Ban a user with optional reason.

**Function:** `banUserAsAdmin(adminId, userId, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
await banUserAsAdmin(adminId, userId, "Violated terms of service");
```

### 11. Unban User Account
Remove ban from user.

**Function:** `unbanUserAsAdmin(adminId, userId, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
await unbanUserAsAdmin(adminId, userId, "Ban appeal approved");
```

### 12. Restore Deleted User
Restore a soft-deleted user account.

**Function:** `restoreDeletedUser(adminId, userId, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
await restoreDeletedUser(adminId, userId, "User requested restoration");
```

### 13. Bulk Update Roles
Update roles for multiple users at once.

**Function:** `bulkUpdateUserRoles(adminId, userIds, newRole, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
const result = await bulkUpdateUserRoles(
  adminId,
  ["user1", "user2", "user3"],
  "moderator",
  "Batch promotion"
);
// Returns: { success: number, failed: number, errors: Record<userId, error> }
```

### 14. Bulk Activate Users
Activate multiple users.

**Function:** `bulkActivateUsers(adminId, userIds, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
const result = await bulkActivateUsers(adminId, ["user1", "user2"]);
```

### 15. Bulk Deactivate Users
Deactivate multiple users.

**Function:** `bulkDeactivateUsers(adminId, userIds, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
const result = await bulkDeactivateUsers(adminId, ["user1", "user2"]);
```

### 16. Bulk Ban Users
Ban multiple users.

**Function:** `bulkBanUsers(adminId, userIds, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
const result = await bulkBanUsers(adminId, ["user1", "user2"]);
```

---

## DELETE Operations

### 1. Soft Delete User
Mark user as deleted (recoverable).

**Function:** `deleteUserAsAdmin(adminId, userId, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
await deleteUserAsAdmin(adminId, userId, "User requested deletion");
// User status set to "deleted" and updatedAt/deletedAt set
```

### 2. Permanently Delete User
Hard delete - completely removes user record (irreversible).

**Function:** `permanentlyDeleteUser(adminId, userId, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
await permanentlyDeleteUser(adminId, userId, "Hard delete for GDPR");
// User document completely removed from Firestore
```

### 3. User Self-Delete
User deletes their own account (soft delete).

**Function:** `deleteUserAccount(userId)`
**Location:** `lib/user-service.ts`

```typescript
await deleteUserAccount(userId);
```

### 4. User Self-Deactivate
User deactivates their own account.

**Function:** `deactivateUserAccount(userId)`
**Location:** `lib/user-service.ts`

```typescript
await deactivateUserAccount(userId);
```

### 5. Bulk Delete Users
Delete multiple users (soft delete).

**Function:** `bulkDeleteUsers(adminId, userIds, reason?)`
**Location:** `lib/admin-service.ts`

```typescript
const result = await bulkDeleteUsers(
  adminId,
  ["user1", "user2", "user3"],
  "Batch deletion"
);
// Returns: { success: number, failed: number, errors }
```

---

## EXPORT Operations

### Export Users Data
Export user data as CSV.

**Function:** `exportUsersData(userIds?)`
**Location:** `lib/admin-service.ts`

```typescript
// Export all users
const csvAll = await exportUsersData();

// Export specific users
const csvSelected = await exportUsersData(["user1", "user2"]);

// Download
const blob = new Blob([csvData], { type: "text/csv" });
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "users.csv";
a.click();
```

---

## Validation Operations

### 1. Check Email Uniqueness
Verify if email is unique or already in use.

**Function:** `isEmailUnique(email, excludeUserId?)`
**Location:** `lib/user-service.ts`

```typescript
const isUnique = await isEmailUnique("user@example.com");
const isUniqueExcept = await isEmailUnique("user@example.com", userId);
```

---

## Complete Example: Admin User Management Workflow

```typescript
import {
  getAllUsersForAdmin,
  searchUsersForAdmin,
  advancedSearchUsers,
  updateUserRoleAsAdmin,
  deactivateUserAsAdmin,
  banUserAsAdmin,
  bulkUpdateUserRoles,
  deleteUserAsAdmin,
  restoreDeletedUser,
  exportUsersData,
} from "@/lib/admin-service";

const handleUserManagement = async (adminId: string) => {
  // 1. Get all users
  const allUsers = await getAllUsersForAdmin();
  console.log(`Total users: ${allUsers.length}`);

  // 2. Search for specific user
  const searchResults = await searchUsersForAdmin("john");
  
  // 3. Advanced search with filters
  const filtered = await advancedSearchUsers({
    role: "user",
    status: "active",
    createdAfter: new Date("2024-10-01")
  });

  // 4. Update single user role
  if (searchResults.length > 0) {
    await updateUserRoleAsAdmin(
      adminId,
      searchResults[0].id,
      "moderator",
      "Promoted to moderator"
    );
  }

  // 5. Bulk operations
  const userIds = filtered.slice(0, 5).map(u => u.id);
  await bulkUpdateUserRoles(adminId, userIds, "moderator");

  // 6. Handle violations
  const violator = allUsers.find(u => u.email === "bad-user@example.com");
  if (violator) {
    await banUserAsAdmin(adminId, violator.id, "Violated terms");
  }

  // 7. Export data
  const csv = await exportUsersData();
  
  // 8. Restore if needed
  const deletedUsers = await advancedSearchUsers({ status: "deleted" });
  if (deletedUsers.length > 0) {
    await restoreDeletedUser(adminId, deletedUsers[0].id, "User requested");
  }
};
```

---

## Error Handling

All CRUD operations include comprehensive error handling:

```typescript
try {
  await updateUserRoleAsAdmin(adminId, userId, "admin");
} catch (error) {
  if (error instanceof Error) {
    console.error("Update failed:", error.message);
    // Handle specific error cases
  }
}
```

**Common Errors:**
- `"User not found"` - User doesn't exist
- `"Invalid role: X"` - Invalid role type
- `"Failed to update user role"` - Database error
- `"Incorrect current password"` - Wrong password for change
- `"Failed to export users data"` - Export failed

---

## Audit Logging

Every admin action is automatically logged:

```typescript
// All operations create audit logs
{
  adminId: string;
  action: "UPDATE_ROLE" | "DEACTIVATE" | "ACTIVATE" | "BAN" | "UNBAN" | "DELETE";
  targetUserId: string;
  targetEmail: string;
  changes: Record<string, any>;
  timestamp: Date;
  reason?: string;
}
```

View logs with:
```typescript
const logs = await getAdminAuditLogs(adminId);
```

---

## Data Types

### UserManagementData
```typescript
interface UserManagementData extends User {
  status?: "active" | "inactive" | "deleted" | "banned";
  lastLogin?: Date;
  loginCount?: number;
  isActive?: boolean;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserRole
```typescript
type UserRole = "user" | "moderator" | "admin";
```

### AdminAuditLog
```typescript
interface AdminAuditLog {
  id?: string;
  adminId: string;
  action: "UPDATE_ROLE" | "DEACTIVATE" | "ACTIVATE" | "BAN" | "UNBAN" | "DELETE";
  targetUserId: string;
  targetEmail: string;
  changes: Record<string, any>;
  timestamp: Date;
  reason?: string;
}
```

---

## Best Practices

1. **Always provide a reason** when performing admin actions
2. **Use bulk operations** for multiple users to reduce API calls
3. **Check audit logs** regularly for compliance
4. **Restore soft-deleted users** rather than hard delete when possible
5. **Validate user existence** before performing operations
6. **Use advanced search** with filters for efficient user lookup
7. **Export data** before major operations for backup
8. **Handle errors gracefully** and inform users of failures

---

## Summary Statistics

- **Total READ operations:** 15
- **Total UPDATE operations:** 16
- **Total DELETE operations:** 5
- **Total EXPORT operations:** 1
- **Total VALIDATION operations:** 1
- **Total BULK operations:** 5

**Total CRUD Operations Implemented: 43**
