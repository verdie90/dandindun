# Auth & RBAC Quick Start Guide

## 🚀 Getting Started with Authentication

Your Dandindun app now has a complete authentication and role-based access control system!

### Quick Links

- **Register Page**: `/en/auth/register` or `/id/auth/register`
- **Login Page**: `/en/auth/login` or `/id/auth/login`
- **Dashboard**: `/en/dashboard` or `/id/dashboard`
- **Admin Panel**: `/en/admin/users` or `/id/admin/users`

## 📋 Test Accounts

To test the system, create new accounts through the registration page. Here are the roles available:

- **Admin**: Full system access, user management
- **Moderator**: Content moderation access
- **User**: Basic access (default role for new users)

## 🔐 Key Features

### 1. User Registration
- Self-service registration
- Email and password required
- Automatic login after registration
- Password validation (min 6 characters)

### 2. User Login
- Email and password authentication
- Session-based authentication
- Automatic session expiration (7 days)
- Secure cookie storage

### 3. Role-Based Access Control (RBAC)
- Three built-in roles: Admin, Moderator, User
- Fine-grained permission system
- Route protection
- Dynamic UI based on permissions

### 4. Dashboard
- User profile information
- Permission overview
- Role-specific sections

### 5. Admin Panel
- User management
- Role assignment
- User listing and filtering

## 💻 Common Code Patterns

### Check if user is authenticated
```tsx
import { useAuth } from "@/components/AuthProvider";

export function MyComponent() {
  const { session } = useAuth();
  
  if (!session.isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {session.user?.name}!</div>;
}
```

### Check user role
```tsx
import { usePermission } from "@/hooks/usePermission";

export function AdminSection() {
  const { checkRole } = usePermission();
  
  if (!checkRole("admin")) {
    return <div>Admin only</div>;
  }

  return <div>Admin panel</div>;
}
```

### Check specific permission
```tsx
import { usePermission } from "@/hooks/usePermission";

export function ContentManager() {
  const { check } = usePermission();
  
  if (!check("canManageContent")) {
    return <div>No permission</div>;
  }

  return <div>Content management tools</div>;
}
```

### Protect entire page/route
```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>This page is only for admins</div>
    </ProtectedRoute>
  );
}
```

### Login/Logout
```tsx
import { useAuth } from "@/components/AuthProvider";

export function AuthButtons() {
  const { session, login, logout } = useAuth();
  
  if (session.isAuthenticated) {
    return (
      <button onClick={logout}>Logout</button>
    );
  }

  return (
    <button onClick={() => login({ email: "...", password: "..." })}>
      Login
    </button>
  );
}
```

## 📊 User Roles & Permissions Matrix

| Feature | User | Moderator | Admin |
|---------|------|-----------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Manage Content | ❌ | ❌ | ✅ |
| Moderate Content | ❌ | ✅ | ✅ |

## 🔄 Auth Flow

```
Registration
    ↓
Create User Account
    ↓
Hash & Store Password
    ↓
Auto Login
    ↓
Create Session
    ↓
Store in Cookie
    ↓
Dashboard Access
```

```
Login
  ↓
Verify Credentials
  ↓
Create Session
  ↓
Store Session ID in Cookie
  ↓
Return Session
  ↓
Dashboard Access
```

```
Logout
  ↓
Delete Session from DB
  ↓
Clear Cookie
  ↓
Redirect to Login
```

## 📁 File Structure

```
app/[locale]/
├── auth/
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/page.tsx
└── admin/
    └── users/page.tsx

components/
├── AuthProvider.tsx          # Auth context
├── ProtectedRoute.tsx        # Route protection
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx

hooks/
└── usePermission.ts         # Permission checking

lib/
├── firebase.ts              # Firebase config
├── auth-service.ts          # Auth functions
└── types/
    └── auth.ts              # TypeScript types
```

## 🐛 Debugging

### Check Authentication State
```tsx
import { useAuth } from "@/components/AuthProvider";

export function DebugAuth() {
  const { session } = useAuth();
  
  return (
    <pre>
      {JSON.stringify({
        isAuthenticated: session.isAuthenticated,
        isLoading: session.isLoading,
        user: session.user,
        error: session.error,
      }, null, 2)}
    </pre>
  );
}
```

### Check User Permissions
```tsx
import { usePermission } from "@/hooks/usePermission";

export function DebugPermissions() {
  const { user, isAuthenticated } = usePermission();
  
  return (
    <pre>
      {JSON.stringify({
        isAuthenticated,
        user,
      }, null, 2)}
    </pre>
  );
}
```

## ✅ Testing Checklist

- [ ] Register new account
- [ ] Login with registered account
- [ ] View user dashboard
- [ ] Logout and verify redirect to login
- [ ] Try accessing protected routes without login
- [ ] Register with duplicate email (should fail)
- [ ] Login with wrong password (should fail)
- [ ] Check permissions display on dashboard
- [ ] Test admin panel (change user roles)
- [ ] Test role-based UI sections

## 🔒 Security Notes

1. **Passwords are hashed** using SHA-256 before storage
2. **Sessions expire after 7 days** of inactivity
3. **Session IDs are stored in secure cookies**
4. **All authentication state is managed client-side via context**
5. **Protected routes check authentication before rendering**

## 📞 Support

For detailed information, see `AUTH_RBAC_DOCS.md`

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] Upgrade password hashing to bcrypt or Argon2
- [ ] Enable HTTPS only
- [ ] Set strong CORS policies
- [ ] Configure Firestore security rules
- [ ] Implement rate limiting
- [ ] Add email verification
- [ ] Set up monitoring and logging
- [ ] Test on production database
- [ ] Create admin accounts
- [ ] Document environment variables
