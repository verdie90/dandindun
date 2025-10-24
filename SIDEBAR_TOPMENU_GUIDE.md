# 📋 Sidebar & TopMenu Integration Guide

## Overview

Dandindun sekarang memiliki sistem navigasi profesional yang terintegrasi dengan permission system dari Firestore.

## 🏗️ Architecture

### Components

```
DashboardLayout (Wrapper)
├── TopMenu (Header)
│   ├── Menu Toggle Button (Mobile)
│   ├── Logo/Brand
│   ├── Notifications Bell
│   ├── ThemeSwitcher
│   ├── LanguageSwitcher
│   └── User Profile Dropdown
└── Main Content Area
    ├── Sidebar (Mobile: Overlay)
    │   ├── Logo Section
    │   ├── Navigation Menu (Permission-Based)
    │   └── User Profile Section
    └── Content (Page Children)
```

---

## 📁 New Components

### 1. **Sidebar Component** (`components/Sidebar.tsx`)

#### Purpose
- Navigasi utama dengan menu berbasis permission
- Menampilkan menu items yang relevan sesuai role user
- Mobile-responsive dengan collapsible submenus

#### Key Features
- ✅ Permission-based menu rendering
- ✅ Active link highlighting
- ✅ Submenu expansion (Admin Panel)
- ✅ User profile section di bottom
- ✅ Quick logout button
- ✅ Role-based admin badge

#### Menu Structure
```typescript
interface MenuItem {
  title: string;           // Menu label
  icon: React.ReactNode;   // Lucide icon
  href: string;            // Link destination
  permission?: string;     // Required permission
  badge?: string;          // Display badge
  submenu?: MenuItem[];    // Nested menu items
}
```

#### Menu Items Generated
```
📍 Home                    (Semua user)
📊 Dashboard               (Semua user, permission: view_dashboard)
🛡️  Admin Panel            (Admin/Moderator)
  ├── 👥 Users            (permission: manage_users)
  ├── 🛡️  Roles            (permission: manage_roles)
  ├── 🔐 Permissions      (permission: manage_permissions)
  ├── ⏱️  Sessions         (permission: manage_users)
  ├── 🌍 Languages        (permission: manage_settings)
  └── ⚙️  Settings         (permission: manage_settings)
```

#### Usage
```tsx
import { Sidebar } from "@/components/Sidebar";

<aside>
  <Sidebar />
</aside>
```

#### User Profile Section
Menampilkan:
- Avatar/Initial user
- Nama lengkap
- Email
- Role (admin/moderator/user)
- Status online (green dot)
- Logout button

---

### 2. **TopMenu Component** (`components/TopMenu.tsx`)

#### Purpose
- Header statis dengan kontrol user dan tema
- Integrasi dengan theme/language switcher
- Mobile menu toggle untuk sidebar

#### Key Features
- ✅ Sticky header (top-0 z-50)
- ✅ User profile dropdown
- ✅ Theme & language switchers
- ✅ Notifications bell
- ✅ Mobile menu toggle
- ✅ Admin tools quick access

#### Dropdown Menu Contents
```
├── User Info (Name, Email)
├── Role Badge
├── Admin/Moderator Badge (if applicable)
├── ─────────────────────────
├── My Profile
├── ─────────────────────────
├── Admin Tools (if admin)
│   ├── Admin Panel
│   └── Settings
├── ─────────────────────────
└── Logout (Red)
```

#### Props
```typescript
interface TopMenuProps {
  onMenuToggle?: () => void;      // Mobile toggle callback
  isSidebarOpen?: boolean;         // Sidebar state
}
```

#### Usage
```tsx
import { TopMenu } from "@/components/TopMenu";

<TopMenu 
  onMenuToggle={handleToggle}
  isSidebarOpen={isOpen}
/>
```

---

### 3. **DashboardLayout Component** (`components/DashboardLayout.tsx`)

#### Purpose
- Layout wrapper yang menggabungkan TopMenu dan Sidebar
- Handle authentication redirect
- Responsive design untuk mobile/tablet/desktop
- Mobile overlay untuk sidebar

#### Key Features
- ✅ Auth guard (redirect ke login jika not authenticated)
- ✅ Responsive sidebar (fixed desktop, overlay mobile)
- ✅ Mobile menu toggle dengan overlay
- ✅ Auto-close sidebar saat navigasi on mobile
- ✅ Window resize listener

#### Responsive Behavior
```
DESKTOP (≥1024px):
┌──────────────────────────────────────┐
│         TopMenu (64px)                │
├──────────────┬──────────────────────┤
│  Sidebar     │                       │
│  (256px)     │  Main Content         │
│              │                       │
│              │                       │
└──────────────┴──────────────────────┘

MOBILE (<1024px):
┌────────────────────────────┐
│ TopMenu (56px)             │
├────────────────────────────┤
│                            │
│   Main Content             │
│                            │
│   [Sidebar as overlay]     │
│                            │
└────────────────────────────┘
```

#### Usage
```tsx
import { DashboardLayout } from "@/components/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <YourPageContent />
    </DashboardLayout>
  );
}
```

---

## 🔐 Permission-Based Access

### How It Works

1. **User Role** → Fetched from Firestore user document
2. **Role Permissions** → Retrieved from roles collection
3. **Menu Items** → Filtered based on user permissions
4. **Access Control** → Components respect permission checks

### Default Roles & Permissions

#### Admin
- `manage_users` - Manage users collection
- `manage_roles` - Create/modify roles
- `manage_permissions` - Manage permissions
- `manage_sessions` - Monitor sessions
- `manage_settings` - App settings
- `view_dashboard` - View dashboard

#### Moderator
- `view_dashboard` - View dashboard
- `moderate_content` - Content moderation
- `view_analytics` - Analytics access

#### User
- `view_dashboard` - View dashboard

### Adding Custom Permissions

1. **Create Permission in Firestore**
```javascript
// permissions collection
{
  id: "custom_permission",
  name: "Custom Permission",
  description: "Permission description",
  category: "custom",
  createdAt: "2024-10-24T...",
  updatedAt: "2024-10-24T..."
}
```

2. **Add to Role**
```typescript
await assignPermissionsToRole("admin", [
  "manage_users",
  "custom_permission"
]);
```

3. **Use in Sidebar** (automatic)
```typescript
{
  title: "Custom Page",
  icon: <Icon />,
  href: "/custom",
  permission: "custom_permission"
}
```

---

## 🎯 Integration with Dashboard Page

### Before
```tsx
// Old: Manual header in each page
<div>
  <header>
    {/* Navigation code duplicated everywhere */}
  </header>
  <main>{/* Page content */}</main>
</div>
```

### After
```tsx
// New: Centralized layout
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
```

### Benefits
- ✅ Single source of truth for navigation
- ✅ Consistent UX across all pages
- ✅ Easy permission management
- ✅ Responsive by default
- ✅ Reduced code duplication

---

## 📱 Mobile Experience

### Features
1. **Hamburger Menu Toggle**
   - Top-left button on mobile
   - Shows X when open

2. **Mobile Sidebar Overlay**
   - Fixed positioning
   - Dark overlay backdrop
   - Auto-closes when navigating

3. **Touch-Friendly**
   - Large tap targets (48px minimum)
   - Proper spacing between items
   - Clear visual feedback

4. **Breakpoints**
   - Mobile: < 768px (sidebar overlay)
   - Tablet: 768px - 1023px (responsive)
   - Desktop: ≥ 1024px (sidebar visible)

---

## 🎨 Styling & Customization

### Colors
- **Active Item**: `bg-primary/10 text-primary`
- **Hover Item**: `text-foreground hover:bg-muted`
- **Admin Badge**: `bg-red-100 text-red-700` (dark: `bg-red-900 dark:text-red-200`)
- **Status Indicator**: `w-2 h-2 rounded-full bg-green-500`

### Spacing
- **Sidebar Width**: 256px (w-64)
- **Padding**: 4px (p-4) per section
- **Gap Between Items**: 8px (space-y-2)
- **Icon Size**: 20px (w-5 h-5)

### Responsive Classes
- `hidden sm:inline` - Hide on mobile
- `lg:hidden` - Hide on desktop
- `lg:col-span-1` - Desktop columns

---

## 🔧 Extending the System

### Add New Menu Item

```typescript
// In Sidebar.tsx, menuItems array
{
  title: "Reports",
  icon: <BarChart3 className="w-5 h-5" />,
  href: "/reports",
  permission: "view_analytics",  // Will only show if user has permission
}
```

### Add Submenu

```typescript
{
  title: "Admin Panel",
  icon: <Shield className="w-5 h-5" />,
  href: "/admin",
  permission: "manage_users",
  badge: "Admin",
  submenu: [
    {
      title: "New Feature",
      icon: <Zap className="w-4 h-4" />,
      href: "/admin/new-feature",
      permission: "manage_new_feature",
    },
    // ... other submenu items
  ]
}
```

### Customize TopMenu

```typescript
// In TopMenu.tsx - add new buttons before user dropdown
<Button variant="ghost" size="icon">
  <Search className="w-5 h-5" />
</Button>
```

---

## 🧪 Testing

### Test Scenarios

1. **Admin User**
   - ✅ All menu items visible
   - ✅ Admin panel accessible
   - ✅ Settings available

2. **Moderator User**
   - ✅ Dashboard visible
   - ✅ Admin panel visible
   - ✅ Limited admin features

3. **Regular User**
   - ✅ Only Dashboard and Profile visible
   - ✅ No admin tools
   - ✅ Simple menu

4. **Mobile Navigation**
   - ✅ Hamburger toggle works
   - ✅ Sidebar overlays correctly
   - ✅ Auto-closes on navigation

5. **Theme Switching**
   - ✅ Dark mode toggles sidebar colors
   - ✅ Light mode maintains contrast
   - ✅ Persists after refresh

---

## 📊 Build Status

```
✓ Compiled successfully in 17.8s
✓ TypeScript check passed
✓ 28 routes generated (SSG)
✓ All admin pages included
✓ No errors or warnings
```

---

## 🚀 Deployment Notes

### Environment Setup
- `NEXT_PUBLIC_FIREBASE_*` - Set in `.env.local`
- `NEXT_PUBLIC_LOCALE_MESSAGES` - i18n configuration

### Performance
- Sidebar: Lazy loads permissions on mount
- TopMenu: Sticky positioned (no layout shift)
- Mobile: Optimized CSS for overlay

### SEO
- All pages still use proper `<main>` tag
- Semantic HTML structure maintained
- Accessible navigation hierarchy

---

## 📝 Related Files

| File | Purpose |
|------|---------|
| `components/Sidebar.tsx` | Main navigation menu |
| `components/TopMenu.tsx` | Header with user control |
| `components/DashboardLayout.tsx` | Layout wrapper |
| `app/[locale]/dashboard/page.tsx` | Dashboard using new layout |
| `lib/role-permission-service.ts` | Permission management |
| `hooks/usePermission.ts` | Permission checks |

---

**Last Updated:** October 24, 2025  
**Status:** ✅ Production Ready  
**Build:** 28/28 routes compiled successfully
