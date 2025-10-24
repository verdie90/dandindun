# Admin Features Quick Start Guide

## 🚀 Getting Started with Admin Panel

This guide provides quick instructions for using the admin management features in Dandindun.

## Prerequisites

- Admin role account
- Logged into the application
- Browser with JavaScript enabled

## Accessing Admin Panel

### 1. Login to Your Account
```
Navigate to → /login
Email: admin@example.com
Password: your_password
```

### 2. Navigate to Admin Pages
All admin pages are available under `/admin`:
- `/admin/users` - User Management
- `/admin/roles` - Role Management
- `/admin/permissions` - Permission Management
- `/admin/sessions` - Session Management
- `/admin/languages` - Language Management
- `/admin/settings` - Application Settings

### 3. Using Admin Sidebar (Future)
The admin sidebar component provides navigation for all admin features with permission-based visibility.

---

## Common Tasks

### Task 1: Manage Users

**Objective:** Add role to a user

**Steps:**
1. Go to `/admin/users`
2. Find user in the table
3. Click role dropdown
4. Select new role (admin, moderator, user)
5. Click Update
6. Confirm success message

**Permissions Required:**
- `manage_users` - View/edit all users
- `edit_users` - Edit specific users

---

### Task 2: Create Custom Role

**Objective:** Create a moderator role with specific permissions

**Steps:**
1. Go to `/admin/roles`
2. Click "New Role" button
3. Fill in role details:
   - Name: "Content Moderator"
   - Description: "Manage user content and reports"
4. Select permissions:
   - ✓ view_users
   - ✓ edit_content
   - ✓ delete_content
5. Click "Create Role"
6. New role now appears in table

**Permissions Required:**
- `manage_roles`

---

### Task 3: Monitor Active Sessions

**Objective:** View and manage user sessions

**Steps:**
1. Go to `/admin/sessions`
2. Review statistics:
   - Active Sessions: [count]
   - Expired Sessions: [count]
3. To terminate a session:
   - Find session in table
   - Click logout icon (🚪)
   - Confirm action
   - Session marked inactive

**Permissions Required:**
- `manage_sessions`

**Tips:**
- Sessions auto-expire after 7 days
- Check for suspicious sessions
- Expired sessions auto-cleanup

---

### Task 4: Add Language Support

**Objective:** Add Indonesian language support

**Steps:**
1. Go to `/admin/languages`
2. Click "Add Language"
3. Select language:
   - Choose "Indonesian (Bahasa Indonesia)"
4. Language fields auto-populate
5. Click "Add Language"
6. Indonesian now appears in language selector

**Available Languages:**
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

**Permissions Required:**
- `manage_settings`

---

### Task 5: Configure Application Settings

**Objective:** Enable maintenance mode

**Steps:**
1. Go to `/admin/settings`
2. Scroll to "Maintenance" section
3. Enable "Maintenance Mode" checkbox
4. Enter maintenance message (optional):
   - "We're updating the system. Back in 1 hour."
5. Click "Save Settings"
6. Only admins can access app during maintenance

**Other Settings:**
- **Site Name/URL:** Change application identity
- **Session Duration:** Adjust session timeout (1-365 days)
- **Password Policy:** Set minimum password length
- **Email Verification:** Require email verification
- **Registration:** Allow/disable public signup

**Permissions Required:**
- `manage_settings`

---

### Task 6: View Available Permissions

**Objective:** Understand system permissions

**Steps:**
1. Go to `/admin/permissions`
2. Scroll through permission list organized by category
3. View permission name and description
4. Permissions grouped by:
   - Users
   - Roles
   - Permissions
   - Sessions
   - Settings
   - Content
   - Analytics
   - System

**To Add Custom Permission:**
1. Click "New Permission"
2. Enter:
   - Name: "moderate_reports"
   - Description: "Review and moderate user reports"
   - Category: "content"
3. Click "Create Permission"
4. Permission now available for role assignment

**Permissions Required:**
- `manage_permissions`

---

## Permission Reference

### User Management Permissions
```
manage_users       → Full user management
create_users       → Create new users
edit_users         → Edit user information
delete_users       → Delete users
view_users         → View user list
```

### Role Permissions
```
manage_roles       → Full role management
create_roles       → Create new roles
edit_roles         → Edit role permissions
delete_roles       → Delete custom roles
```

### Permission Permissions
```
manage_permissions → Full permission management
create_permissions → Create new permissions
edit_permissions   → Edit permissions
delete_permissions → Delete permissions
```

### Session Permissions
```
manage_sessions    → View/manage sessions
terminate_sessions → Force user logout
```

### Settings Permissions
```
manage_settings    → Configure application
view_audit_logs    → View activity logs
```

---

## Default Roles & Permissions

### Admin Role
- All permissions
- Unrestricted access
- System configuration

### Moderator Role
- Content moderation
- User reporting
- Limited user management
- View analytics

### User Role
- View own profile
- Edit own profile
- View dashboard

---

## Troubleshooting

### I can't access admin pages

**Possible causes:**
1. Not logged in → Login first
2. Don't have admin role → Request admin privileges
3. Permissions missing → Contact admin
4. Session expired → Re-login

**Solution:**
```
1. Go to /login
2. Login with admin credentials
3. Navigate to /admin/users
4. If still denied, check your role
```

### Changes not saving

**Possible causes:**
1. Network error
2. Invalid input
3. Firestore permissions
4. Session timeout

**Solution:**
1. Check browser console (F12) for errors
2. Verify all form fields are valid
3. Check network connectivity
4. Re-login if session expired
5. Retry operation

### Session not terminating

**Possible causes:**
1. Session already expired
2. Permission denied
3. Database error

**Solution:**
1. Refresh page to see updated sessions
2. Verify session exists
3. Try again after refresh
4. Check browser console for errors

### Language not appearing

**Possible causes:**
1. Language not activated
2. Translation missing
3. Cache issue

**Solution:**
1. Ensure language is "Active" in settings
2. Set as default if needed
3. Clear browser cache
4. Restart application

---

## Best Practices

### ✅ DO

- [ ] Review sessions regularly
- [ ] Use principle of least privilege
- [ ] Set strong password policies
- [ ] Monitor user activity
- [ ] Backup settings before major changes
- [ ] Test changes in staging first
- [ ] Keep admin accounts secure
- [ ] Review role permissions regularly

### ❌ DON'T

- [ ] Grant admin role to everyone
- [ ] Use weak passwords
- [ ] Leave maintenance mode enabled
- [ ] Disable all permissions from a role
- [ ] Create roles without descriptions
- [ ] Ignore security warnings
- [ ] Share admin credentials
- [ ] Delete system roles

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open command palette (future) |
| `Escape` | Close dialog |
| `Tab` | Navigate fields |
| `Enter` | Submit form |

---

## API Response Times

| Operation | Typical Time |
|-----------|--------------|
| Load users | 1-3s |
| Update user role | <1s |
| Create role | 2-4s |
| Terminate session | <1s |
| Save settings | 2-3s |
| Add language | 1-2s |

---

## Security Reminders

🔐 **Important:**
1. Never share admin credentials
2. Always logout after admin tasks
3. Review unexpected sessions
4. Keep passwords secure
5. Enable email verification for security
6. Monitor failed login attempts
7. Regular security audits
8. Keep system updated

---

## Support Resources

- 📖 [Full Admin Documentation](./ADMIN_MANAGEMENT_DOCS.md)
- 🔐 [Auth & RBAC Documentation](./AUTH_RBAC_DOCS.md)
- 🌍 [Multi-Language Setup](./MULTILANG_SETUP.md)
- 💬 [API Documentation](./API_DOCS.md) (future)

---

## Version Info

- **Last Updated:** 2024
- **Admin Features:** Complete
- **Status:** Production Ready

