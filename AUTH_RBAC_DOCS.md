# Auth & RBAC System Documentation

## Overview

Dandindun includes a complete authentication and role-based access control (RBAC) system using Firestore. This system uses custom password hashing (SHA-256) and session management without Firebase Authentication.

## Architecture

### Components

- **Firebase Integration**: Direct Firestore for user and session storage
- **Auth Context**: Global authentication state management
- **Custom Auth Service**: User registration, login, logout, and role management
- **RBAC System**: Role-based permissions and access control
- **Protected Routes**: Route protection with role and permission checking

## User Roles

### 1. **Admin**
- **Permissions:**
  - View Dashboard
  - Manage Users (change roles)
  - Manage Content
  - Moderate Content
- **Access:** Admin panel, user management, system settings

### 2. **Moderator**
- **Permissions:**
  - View Dashboard
  - Moderate Content (review reported items)
- **Access:** Dashboard, moderation tools

### 3. **User** (Default)
- **Permissions:**
  - View Dashboard only
- **Access:** Dashboard, personal profile

## Database Structure

### Firestore Collections

#### `users` Collection
```
users/
├── {userId}/
│   ├── id: string
│   ├── email: string
│   ├── name: string
│   ├── role: "admin" | "moderator" | "user"
│   ├── createdAt: ISO string
│   ├── updatedAt: ISO string
│   └── credentials/
│       └── password/
│           ├── hash: string (SHA-256)
│           └── updatedAt: ISO string
```

#### `sessions` Collection
```
sessions/
├── {sessionId}/
│   ├── userId: string
│   ├── userEmail: string
│   ├── createdAt: ISO string
│   └── expiresAt: ISO string (7 days)
```

## Usage

### 1. Register a New User

```tsx
import { useAuth } from "@/components/AuthProvider";

export function RegisterComponent() {
  const { register } = useAuth();

  const handleRegister = async () => {
    try {
      await register({
        email: "user@example.com",
        password: "securePassword123",
        name: "John Doe",
      });
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return <button onClick={handleRegister}>Register</button>;
}
```

### 2. Login

```tsx
import { useAuth } from "@/components/AuthProvider";

export function LoginComponent() {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: "user@example.com",
        password: "securePassword123",
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### 3. Logout

```tsx
import { useAuth } from "@/components/AuthProvider";

export function LogoutComponent() {
  const { logout, session } = useAuth();

  return (
    <button onClick={logout}>
      Logout {session.user?.name}
    </button>
  );
}
```

### 4. Check User Authentication

```tsx
import { useAuth } from "@/components/AuthProvider";

export function Dashboard() {
  const { session } = useAuth();

  if (session.isLoading) return <div>Loading...</div>;

  if (!session.isAuthenticated) {
    return <div>Please login first</div>;
  }

  return (
    <div>
      Welcome, {session.user?.name}!
      <p>Your role: {session.user?.role}</p>
    </div>
  );
}
```

### 5. Check Permissions

```tsx
import { usePermission } from "@/hooks/usePermission";

export function AdminOnlyComponent() {
  const { check, checkRole, isAuthenticated } = usePermission();

  if (!isAuthenticated) return <div>Not authenticated</div>;

  if (checkRole("admin")) {
    return <div>You have admin access!</div>;
  }

  if (check("canManageUsers")) {
    return <div>You can manage users</div>;
  }

  return <div>No special permissions</div>;
}
```

### 6. Protect Routes

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ProtectedPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin only content</div>
    </ProtectedRoute>
  );
}
```

## Available Permissions

The RBAC system includes these permissions:

- `canViewDashboard` - Access to dashboard
- `canManageUsers` - Manage user accounts and roles
- `canManageContent` - Create and modify content
- `canModerateContent` - Review and moderate user content

## Auth Service Functions

### `registerUser(credentials: RegisterCredentials): Promise<User>`
Register a new user account.

```tsx
const user = await registerUser({
  email: "new@example.com",
  password: "password123",
  name: "New User",
});
```

### `loginUser(credentials: LoginCredentials): Promise<User & { sessionId: string }>`
Authenticate a user and create a session.

```tsx
const result = await loginUser({
  email: "user@example.com",
  password: "password123",
});
const { sessionId, ...user } = result;
```

### `logoutUser(sessionId: string): Promise<void>`
Invalidate a session and logout the user.

```tsx
await logoutUser(sessionId);
```

### `getUserBySession(sessionId: string): Promise<User | null>`
Get user information from session ID.

```tsx
const user = await getUserBySession(sessionId);
```

### `updateUserRole(userId: string, newRole: UserRole): Promise<void>`
Update a user's role (admin only).

```tsx
await updateUserRole("userId123", "moderator");
```

### `getAllUsers(): Promise<User[]>`
Retrieve all users (admin only).

```tsx
const allUsers = await getAllUsers();
```

### `hasPermission(role: UserRole, permission: string): boolean`
Check if a role has a specific permission.

```tsx
const canManageUsers = hasPermission("admin", "canManageUsers");
```

## Pages

### Authentication Pages

- **`/en/auth/login`** or **`/id/auth/login`** - Login page
- **`/en/auth/register`** or **`/id/auth/register`** - Registration page

### Protected Pages

- **`/en/dashboard`** or **`/id/dashboard`** - User dashboard (requires authentication)
- **`/en/admin/users`** or **`/id/admin/users`** - User management (requires admin role)

## Security Features

1. **Password Hashing**: SHA-256 hashing (consider upgrading to bcrypt in production)
2. **Session Management**: 7-day session expiration with automatic cleanup
3. **Role-Based Access Control**: Fine-grained permission system
4. **Protected Routes**: Automatic redirection for unauthorized access
5. **Type Safety**: Full TypeScript support

## Environment Setup

### Firebase Configuration

The Firebase configuration is stored in `lib/firebase.ts`:

```tsx
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};
```

## Best Practices

1. **Always validate input** on both client and server
2. **Use HTTPS only** in production
3. **Keep session expiration reasonable** (7 days default)
4. **Regularly audit user roles** and permissions
5. **Log authentication events** for security monitoring
6. **Use strong password requirements** (enforce in registration)
7. **Implement rate limiting** on login attempts
8. **Never expose password hashes** or session IDs in logs

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
2. **Email Verification** for new accounts
3. **Password Reset** functionality
4. **OAuth Integration** (Google, GitHub, etc.)
5. **Activity Logging** and audit trails
6. **Session Management Dashboard**
7. **IP Whitelisting** for admin accounts
8. **Bcrypt or Argon2** for better password hashing

## Troubleshooting

### "User not found" error on login
- Verify the email address is correct
- Ensure the user is registered

### "Invalid credentials" error
- Check password is correct
- Session might have expired

### Session expires unexpectedly
- Session expiration is set to 7 days
- Check browser cookie settings

### Permission denied errors
- Verify user role has required permissions
- Check with admin to update role if needed

## Support

For issues or questions, contact the development team or check the inline code documentation.
