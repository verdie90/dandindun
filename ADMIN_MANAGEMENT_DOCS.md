# Admin Management Pages Documentation

## Overview

This document provides detailed information about all administrative management pages in the Dandindun application. These pages are restricted to users with admin role and provide comprehensive system management capabilities.

## Table of Contents

1. [User Management](#user-management)
2. [Role Management](#role-management)
3. [Permission Management](#permission-management)
4. [Session Management](#session-management)
5. [Language Management](#language-management)
6. [Application Settings](#application-settings)
7. [Admin Sidebar Navigation](#admin-sidebar-navigation)

---

## User Management

**Location:** `/admin/users`

**Purpose:** Manage user accounts, assign roles, and view user information.

### Features

- **User List Table**
  - Display all registered users
  - Show user email, name, role, and account status
  - Real-time user count

- **Role Assignment**
  - Assign/change user roles (admin, moderator, user)
  - Update user information inline
  - Batch operations (future enhancement)

- **User Filtering**
  - Search users by email or name
  - Filter by role
  - Filter by status (active/inactive)

- **Actions**
  - Edit user profile
  - Change user role
  - Deactivate/activate users
  - Delete user accounts

### Permissions Required

- `manage_users` - Full user management access

### Implementation

- **Service:** `lib/user-service.ts`
- **Component:** `app/[locale]/admin/users/page.tsx`
- **API Methods:**
  - `getAllUsers()` - Fetch all users
  - `updateUserRole()` - Change user role
  - `deactivateUser()` - Deactivate user account
  - `deleteUser()` - Delete user permanently

---

## Role Management

**Location:** `/admin/roles`

**Purpose:** Create, manage, and assign permissions to roles.

### Features

- **Role List Table**
  - Display all system roles
  - Show role description and assigned permissions
  - Distinguish between system and custom roles
  - Total role count

- **Role Creation**
  - Create new custom roles
  - Assign multiple permissions
  - Set role description
  - Auto-permission selection

- **Permission Assignment**
  - Select from available permissions
  - Visual permission list with descriptions
  - Permission categories organization

- **System Roles**
  - `admin` - Full system access
  - `moderator` - Content and user moderation
  - `user` - Standard user permissions
  - Cannot delete system roles

- **Actions**
  - Create new role
  - Edit role permissions
  - Delete custom roles
  - Set as default

### Roles & Permissions

#### System Roles

```
Admin
├── Users Management
├── Roles Management
├── Permissions Management
├── Sessions Management
├── Settings Management
└── Full System Access

Moderator
├── Content Moderation
├── User Reports
└── Limited User Management

User
├── View Profile
├── Edit Profile
└── View Dashboard
```

### Implementation

- **Service:** `lib/role-permission-service.ts`
- **Component:** `app/[locale]/admin/roles/page.tsx`
- **API Methods:**
  - `getAllRoles()` - Fetch all roles
  - `createRole()` - Create new role
  - `getRolePermissions()` - Get role permissions
  - `updateRole()` - Update role settings
  - `deleteRole()` - Delete custom role

---

## Permission Management

**Location:** `/admin/permissions`

**Purpose:** Manage system permissions and their categories.

### Features

- **Permission List (by Category)**
  - Organized by category for easy navigation
  - Show permission name and description
  - Display category badges
  - Total permission count

- **Permission Categories**
  - Users - User-related permissions
  - Roles - Role management permissions
  - Permissions - Permission management
  - Sessions - Session management
  - Settings - Application settings
  - Content - Content management
  - Analytics - Analytics access
  - System - System operations

- **Permission Creation**
  - Add new custom permissions
  - Assign category
  - Set description
  - Auto-generated permission IDs

- **Actions**
  - Create permission
  - Delete permission
  - View permission details

### Available Permissions

```
Users
├── manage_users
├── create_users
├── edit_users
├── delete_users
└── view_users

Roles
├── manage_roles
├── create_roles
├── edit_roles
└── delete_roles

Permissions
├── manage_permissions
├── create_permissions
├── edit_permissions
└── delete_permissions

Sessions
├── manage_sessions
└── terminate_sessions

Settings
├── manage_settings
└── view_audit_logs

Content
├── create_content
├── edit_content
└── delete_content

Analytics
├── view_analytics
└── export_reports

System
├── system_config
└── database_access
```

### Implementation

- **Service:** `lib/role-permission-service.ts`
- **Component:** `app/[locale]/admin/permissions/page.tsx`
- **API Methods:**
  - `getAllPermissions()` - Fetch all permissions
  - `createPermission()` - Create new permission
  - `deletePermission()` - Delete permission
  - `getPermissionsByCategory()` - Get by category

---

## Session Management

**Location:** `/admin/sessions`

**Purpose:** Monitor and manage active user sessions.

### Features

- **Session Statistics**
  - Total active sessions
  - Total expired sessions
  - Real-time count updates

- **Active Sessions Table**
  - User ID and email
  - Session creation time
  - Session expiration time
  - Session status (Active/Expired)
  - Last activity timestamp

- **Session Actions**
  - Terminate individual sessions
  - Force user logout
  - View session details
  - Auto-cleanup of expired sessions

- **Expired Sessions View**
  - Historical session data
  - Read-only display
  - Auto-cleanup scheduling

### Session Lifecycle

```
User Login
  ↓
Session Created (max 7 days)
  ↓
Last Activity Updated
  ↓
Session Expires OR Manual Termination
  ↓
Session Marked Inactive
```

### Implementation

- **Service:** `lib/session-service.ts`
- **Component:** `app/[locale]/admin/sessions/page.tsx`
- **API Methods:**
  - `getAllActiveSessions()` - Get all active sessions
  - `terminateSession()` - Force logout user
  - `getSessionStats()` - Session statistics
  - `cleanupExpiredSessions()` - Cleanup routine
  - `updateSessionActivity()` - Track activity

---

## Language Management

**Location:** `/admin/languages`

**Purpose:** Configure supported languages and language settings.

### Features

- **Installed Languages Table**
  - Language code, name, native name
  - Active/inactive status
  - Default language indicator
  - Total installed count

- **Language Installation**
  - Add new languages from predefined list
  - 10+ languages available:
    - English (en)
    - Indonesian (id)
    - Spanish (es)
    - French (fr)
    - German (de)
    - Portuguese (pt)
    - Russian (ru)
    - Chinese (zh)
    - Japanese (ja)
    - Korean (ko)

- **Language Management**
  - Activate/deactivate languages
  - Set default language
  - View language metadata
  - Delete custom languages

- **Language Status**
  - `Active` - Available for users
  - `Inactive` - Hidden from selection
  - `Default` - Used for non-authenticated users

### Implementation

- **Service:** `lib/settings-service.ts`
- **Component:** `app/[locale]/admin/languages/page.tsx`
- **API Methods:**
  - `getAllLanguages()` - Fetch all languages
  - `getActiveLanguages()` - Get active languages only
  - `addLanguage()` - Install language
  - `updateLanguage()` - Update language status
  - `deleteLanguage()` - Remove language
  - `setDefaultLanguage()` - Set as default

---

## Application Settings

**Location:** `/admin/settings`

**Purpose:** Configure global application settings and preferences.

### Settings Sections

#### 1. Site Information
- **Site Name:** Application title
- **Site Description:** Short description
- **Site URL:** Base URL
- **Support Email:** Support contact email

#### 2. Maintenance
- **Maintenance Mode:** Enable/disable
- **Maintenance Message:** Custom message for users
- Only admins can access during maintenance

#### 3. Session & Security
- **Max Session Duration:** Session validity (1-365 days)
- **Minimum Password Length:** Password policy (4-32 chars)
- **Email Verification:** Require email verification
- **Password Requirements:** Future: Complexity rules

#### 4. Registration
- **Allow Registration:** Enable/disable public signup
- When disabled: Admin-only user creation
- Default: Enabled

### Configuration File

Settings are stored in Firestore:
```
Collection: app_settings
Document: default

Fields:
{
  siteName: string,
  siteDescription: string,
  siteUrl: string,
  logo?: string,
  favicon?: string,
  supportEmail: string,
  maintenanceMode: boolean,
  maintenanceMessage?: string,
  maxSessionDuration: number,
  passwordMinLength: number,
  requireEmailVerification: boolean,
  allowRegistration: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Implementation

- **Service:** `lib/settings-service.ts`
- **Component:** `app/[locale]/admin/settings/page.tsx`
- **API Methods:**
  - `getAppSettings()` - Fetch settings
  - `updateAppSettings()` - Save settings
  - `initializeAppSettings()` - Initialize defaults

---

## Admin Sidebar Navigation

**Location:** `components/AdminSidebar.tsx`

**Purpose:** Navigation component for admin panel with permission-based menu items.

### Features

- **Menu Items (Permission-Based)**
  - User Management
  - Roles
  - Permissions
  - Sessions
  - Languages
  - Settings

- **Dynamic Filtering**
  - Only shows items user has permission for
  - Permission checking on render
  - Icons for each menu item

- **Current Page Highlighting**
  - Highlights active menu item
  - Shows chevron indicator
  - Visual feedback

### Implementation

```tsx
<AdminSidebar />
```

### Permissions Required

- User Management: `manage_users`
- Roles: `manage_roles`
- Permissions: `manage_permissions`
- Sessions: `manage_sessions`
- Languages: `manage_settings`
- Settings: `manage_settings`

---

## Access Control

All admin pages implement multi-layer access control:

### 1. Route Level
- Protected routes redirect unauthorized users
- Uses `usePermission()` hook
- Checks `checkRole("admin")`

### 2. Feature Level
- Components check specific permissions
- Elements hidden if user lacks permission
- Buttons disabled for restricted actions

### 3. API Level
- Server functions validate permissions
- Firestore rules enforce access
- Operations fail if unauthorized

### Example

```tsx
const { checkRole } = usePermission();

useEffect(() => {
  if (!session.isLoading && !checkRole("admin")) {
    router.push("/dashboard");
  }
}, [session.isLoading, checkRole, router]);
```

---

## Error Handling

All pages include comprehensive error handling:

- **User-Friendly Errors:** Clear, actionable messages
- **Validation:** Form validation before submission
- **Feedback:** Success/error alerts with auto-dismiss
- **Loading States:** Spinners during operations
- **Retry Logic:** Ability to retry failed operations

---

## Best Practices

### For Administrators

1. **Regularly Review Sessions**
   - Monitor active sessions
   - Terminate suspicious sessions
   - Check for unauthorized access

2. **Manage Roles Carefully**
   - Follow principle of least privilege
   - Don't assign excessive permissions
   - Review role permissions regularly

3. **Configure Languages Properly**
   - Activate only needed languages
   - Set appropriate default language
   - Test translations before activation

4. **Review Settings**
   - Keep security settings updated
   - Monitor maintenance mode
   - Review session duration settings

### For Developers

1. **Adding New Admin Pages**
   ```tsx
   // 1. Create service in lib/
   // 2. Add permission check via usePermission()
   // 3. Implement CRUD operations
   // 4. Add to AdminSidebar menu
   // 5. Add translations for menu items
   ```

2. **Permission Naming Convention**
   ```
   manage_[resource]     - Full management
   create_[resource]     - Create operations
   edit_[resource]       - Edit operations
   delete_[resource]     - Delete operations
   view_[resource]       - View-only access
   ```

3. **Testing Admin Pages**
   ```bash
   # Login as admin
   # Navigate to admin pages
   # Test CRUD operations
   # Verify permission restrictions
   ```

---

## File Structure

```
app/[locale]/admin/
├── users/
│   └── page.tsx          # User management
├── roles/
│   └── page.tsx          # Role management
├── permissions/
│   └── page.tsx          # Permission management
├── sessions/
│   └── page.tsx          # Session management
├── languages/
│   └── page.tsx          # Language management
└── settings/
    └── page.tsx          # Application settings

components/
└── AdminSidebar.tsx      # Navigation component

lib/
├── user-service.ts       # User operations
├── role-permission-service.ts  # Role/Permission operations
├── session-service.ts    # Session operations
└── settings-service.ts   # Settings/Language operations
```

---

## Security Considerations

1. **Access Control**
   - All admin pages require admin role
   - Permission checks on every action
   - Firestore rules enforce authorization

2. **Data Validation**
   - Input validation on all forms
   - Sanitization of user input
   - Type checking with TypeScript

3. **Audit Trail**
   - Activity logging (future enhancement)
   - Session tracking
   - Change history (future enhancement)

4. **Session Security**
   - Session timeout after 7 days
   - Automatic cleanup of expired sessions
   - Force logout capability

---

## Future Enhancements

- [ ] Bulk user operations
- [ ] Advanced user filtering
- [ ] Audit logs for all operations
- [ ] User activity heatmap
- [ ] Role templates
- [ ] Permission inheritance
- [ ] Scheduled maintenance windows
- [ ] Multi-language custom permissions
- [ ] Permission delegation
- [ ] Admin activity dashboard

---

## Troubleshooting

### "Access Denied" Error
- Check if user has admin role
- Verify permissions in role
- Clear session and re-login

### Settings Not Saving
- Check browser console for errors
- Verify Firestore credentials
- Check network connectivity
- Review Firestore rules

### Session Not Terminating
- Verify session exists
- Check Firestore write permissions
- Try refreshing page

### Language Not Activating
- Verify language data is valid
- Check for duplicate language codes
- Ensure default language exists

---

## Support

For issues or questions about admin pages:
1. Check this documentation
2. Review component source code
3. Check Firestore collections
4. Check browser console errors
5. Review Firebase logs

