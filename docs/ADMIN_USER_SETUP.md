# 🔐 Admin User Setup Guide

## Daftar Isi
1. [Quick Start](#quick-start)
2. [Setup Methods](#setup-methods)
3. [Admin Permissions](#admin-permissions)
4. [Security Notes](#security-notes)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Membuat Admin User dengan API

#### Method 1: GET - Check Status
```bash
curl http://localhost:3000/api/setup/admin
```

**Response (No Admin):**
```json
{
  "adminExists": false,
  "adminCount": 0,
  "status": "Ready for admin setup - POST to create admin user"
}
```

#### Method 2: POST - Create Admin
```bash
curl -X POST http://localhost:3000/api/setup/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!@#",
    "name": "System Administrator"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "userId": "user-123-abc-def",
  "email": "admin@example.com",
  "name": "System Administrator",
  "role": "admin",
  "permissions": {
    "pages": [
      "/admin/users",
      "/admin/roles",
      "/admin/settings",
      "/admin/logs",
      "/admin/permissions",
      "/admin/role-permissions",
      "/dashboard",
      "/profile"
    ],
    "operations": [
      "deleteUser",
      "banUser",
      "unbanUser",
      "resetPassword",
      "changeRole",
      "editProfile",
      "exportData",
      "viewLogs",
      "createRole",
      "editRole",
      "deleteRole",
      "createPermission",
      "editPermission",
      "deletePermission",
      "managePagePermissions",
      "manageOperationPermissions"
    ]
  },
  "message": "Admin user created successfully"
}
```

---

## Setup Methods

### Method 1: API Route (Recommended)

**Endpoint:** `POST /api/setup/admin`

**Default Credentials:**
- Email: `admin@example.com`
- Password: `Admin123!@#`

**Custom Credentials:**
```javascript
// Using JavaScript/Fetch
const response = await fetch("/api/setup/admin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "your-admin@example.com",
    password: "YourPassword123!",
    name: "Your Name"
  }),
});

const data = await response.json();
console.log(data);
```

### Method 2: Web UI Setup Page

Visit: `http://localhost:3000/admin/setup`

(Coming soon - Interactive setup form)

### Method 3: Firestore Console (Manual)

1. Go to Firebase Console
2. Open Firestore Database
3. Create document in `roles` collection:
   ```
   Collection: roles
   Document ID: admin
   Data:
   {
     "id": "admin",
     "name": "Administrator",
     "description": "Full system access",
     "permissions": ["view_dashboard", "manage_users", ...],
     "isSystemRole": true,
     "createdAt": 2025-10-24T00:00:00Z,
     "updatedAt": 2025-10-24T00:00:00Z
   }
   ```
4. Create document in `users` collection with admin data
5. Create subcollection `credentials/password` with hashed password

---

## Admin Permissions

### Page Access (Full - All Operations)
The admin user has full access (CREATE, READ, UPDATE, DELETE) to:

| Page | Path | Operations |
|------|------|------------|
| Users Management | `/admin/users` | C, R, U, D |
| Roles Management | `/admin/roles` | C, R, U, D |
| Settings | `/admin/settings` | C, R, U, D |
| Activity Logs | `/admin/logs` | C, R, U, D |
| Permissions | `/admin/permissions` | C, R, U, D |
| Role Permissions | `/admin/role-permissions` | C, R, U, D |
| Dashboard | `/dashboard` | C, R, U, D |
| User Profile | `/profile` | C, R, U, D |

### Special Operations (16 Total)

#### User Management
- ✅ `deleteUser` - Permanently delete user accounts
- ✅ `banUser` - Ban users from the platform
- ✅ `unbanUser` - Unban previously banned users
- ✅ `resetPassword` - Reset user passwords
- ✅ `changeRole` - Change user roles

#### User Profile
- ✅ `editProfile` - Edit user profiles
- ✅ `exportData` - Export user data

#### Logs & Monitoring
- ✅ `viewLogs` - View system activity logs

#### Role Management
- ✅ `createRole` - Create new roles
- ✅ `editRole` - Modify existing roles
- ✅ `deleteRole` - Delete roles

#### Permission Management
- ✅ `createPermission` - Create permissions
- ✅ `editPermission` - Edit permissions
- ✅ `deletePermission` - Delete permissions
- ✅ `managePagePermissions` - Manage page access permissions
- ✅ `manageOperationPermissions` - Manage operation permissions

---

## Security Notes

### ⚠️ IMPORTANT

1. **Change Default Password**
   - First login: Change the default password immediately
   - Use a strong, unique password (min 12 characters)
   - Include: uppercase, lowercase, numbers, special chars

2. **Credential Storage**
   - Store credentials in a secure password manager
   - Never commit credentials to git
   - Use environment variables for sensitive data

3. **Access Control**
   - Only one admin should exist initially
   - Create additional admins through the UI
   - Regularly audit admin accounts

4. **Audit Logging**
   - All admin actions are logged
   - Review activity logs periodically
   - Set up alerts for sensitive operations

5. **Database Security**
   - Enable Firestore security rules
   - Restrict API route to authorized callers
   - Use HTTPS only in production

### Sample Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only admins can access setup API
    match /users/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
    
    match /roles/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

---

## Troubleshooting

### ❌ "Admin user already exists"

**Problem:** Setup returns error that admin exists

**Solutions:**
1. If you forgot the password:
   - Delete the admin user from Firestore
   - Run setup again with new credentials
   
2. To check existing admin:
   ```bash
   curl http://localhost:3000/api/setup/admin
   ```

### ❌ "Firebase service account key not found"

**Problem:** Setup cannot connect to Firebase

**Solutions:**
1. Verify Firebase config in `lib/firebase.ts`
2. Check `.env.local` has Firebase credentials
3. Ensure Firestore is initialized

### ❌ "Failed to create user"

**Problem:** User creation fails

**Logs to check:**
- Browser console (F12)
- Server logs (terminal)
- Firebase Console → Functions

**Common causes:**
- Missing Firebase permissions
- Network connectivity
- Invalid email format

### ❌ "Cannot login with created admin"

**Problem:** Admin user created but login fails

**Solutions:**
1. Verify password is correct
2. Check user email in Firestore
3. Ensure session collection exists
4. Clear browser cache and cookies

---

## Post-Setup Steps

### 1. Verify Admin User
```bash
# Check admin exists
curl http://localhost:3000/api/setup/admin

# Login and verify
curl http://localhost:3000/auth/login \
  -d "email=admin@example.com&password=Admin123!@#"
```

### 2. Update Admin Profile
1. Login to admin panel
2. Go to Profile settings
3. Update name, avatar, info
4. Save changes

### 3. Create Additional Admins
1. Go to `/admin/users`
2. Create new user
3. Set role to "admin"
4. Notify user of credentials

### 4. Configure Roles & Permissions
1. Go to `/admin/roles`
2. Review default roles (admin, moderator, user)
3. Create custom roles as needed
4. Configure page permissions
5. Configure operation permissions

### 5. Enable Audit Logging
1. Go to `/admin/settings`
2. Enable activity logging
3. Set log retention period
4. Configure alerts

### 6. Setup Backup & Recovery
1. Enable Firestore backups
2. Configure data export
3. Document recovery procedures
4. Test recovery process

---

## API Reference

### GET /api/setup/admin
Check if admin user exists

**Response (Admin exists):**
```json
{
  "adminExists": true,
  "adminCount": 1,
  "admins": [
    {
      "id": "user-id",
      "email": "admin@example.com",
      "name": "System Admin",
      "createdAt": "2025-10-24T10:00:00Z"
    }
  ],
  "status": "Admin user(s) already configured"
}
```

### POST /api/setup/admin
Create admin user

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!@#",
  "name": "System Administrator"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "user-id",
  "email": "admin@example.com",
  "name": "System Administrator",
  "role": "admin",
  "permissions": { ... }
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Setup (Optional)
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_ADMIN_NAME=System Administrator
```

---

## FAQ

**Q: Can I create multiple admin users?**
A: Yes! After the initial admin is created, you can create more admin users through the `/admin/users` page.

**Q: How do I reset the admin password?**
A: 
1. Login as admin
2. Go to Profile settings
3. Click "Change Password"
4. Or, delete the admin user and recreate it

**Q: Can I disable the admin user?**
A: Yes, through the admin panel under user management (if another admin exists).

**Q: What happens if all admins are deleted?**
A: Create a new admin using `POST /api/setup/admin` again.

**Q: How is the password stored?**
A: Passwords are hashed using SHA-256 and stored in a subcollection.

**Q: Can I export admin credentials?**
A: Only through the API response after creation. Store it securely.

---

## Related Documentation

- [Permission System](./PERMISSION_SYSTEM.md)
- [User Management](./USER_MANAGEMENT.md)
- [Security Best Practices](./SECURITY.md)
- [Firebase Setup](./FIREBASE_SETUP.md)

---

**Last Updated:** October 24, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
