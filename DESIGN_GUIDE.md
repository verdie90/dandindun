# 🎨 Dandindun - Design & Layout Guide

Panduan lengkap desain dan tata letak halaman di Dandindun.

## 📱 Responsive Design

Semua halaman dirancang responsif untuk:
- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

---

## 🏠 Home Page (`/`)

### Tujuan
Landing page untuk menampilkan fitur dan mengajak pengguna untuk mendaftar.

### Sektor

#### 1. Navigation Header
```
┌─────────────────────────────────────────────┐
│ D Dandindun          [Theme] [Language] [CTA] │
└─────────────────────────────────────────────┘
```

#### 2. Hero Section
```
┌──────────────────────────────────────────┐
│                                          │
│        Sambut Kembali Pengguna! 👋      │
│   Kelola akun dan akses dashboard Anda  │
│                                          │
│      [Register]  [Login]                │
│       ✨ Gratis • Instant • Mudah       │
└──────────────────────────────────────────┘
```

#### 3. Features Grid (6 Cards)
```
┌──────────┬──────────┬──────────┐
│  Globe   │ Shield   │ Lock     │
│  Multi-  │ RBAC     │Security  │
│ Language │          │          │
├──────────┼──────────┼──────────┤
│  Zap     │  Users   │ Analytics│
│ Fast &   │  Manage  │  Track   │
│ Responsive│ Users   │ Activity │
└──────────┴──────────┴──────────┘
```

#### 4. Benefits Section
```
┌─────────────────────┬──────────────────┐
│ ✅ Production Ready │  Get Started     │
│ ✅ Multi-Language   │  1. Create Acct  │
│ ✅ Dark/Light       │  2. Customize    │
│ ✅ Admin Panel      │  3. Go Live      │
│ ✅ TypeScript       │  [Register Now]  │
│ ✅ React 19         │                  │
└─────────────────────┴──────────────────┘
```

#### 5. CTA Section
```
┌──────────────────────────────────┐
│  Ready to get started?           │
│  Join thousands of developers    │
│  [Register Now]  [Sign In]       │
└──────────────────────────────────┘
```

#### 6. Footer
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Dandindun    │ Product      │ Resources    │ Legal        │
│ Modern auth  │ • Features   │ • Docs       │ • Privacy    │
│ + admin      │ • Pricing    │ • Support    │ • Terms      │
└──────────────┴──────────────┴──────────────┴──────────────┘
© 2024 Dandindun. All rights reserved.
```

---

## 🔐 Login Page (`/auth/login`)

### Layout
```
┌────────────────────────────────────────────────┐
│  D Dandindun   [Theme] [Language]              │
├────────────────────────────────────────────────┤
│                                                │
│            Login to Dandindun                  │
│         Masuk ke akun Anda                     │
│                                                │
│        ┌──────────────────────────┐            │
│        │  Email                   │            │
│        │  [email@example.com]     │            │
│        │                          │            │
│        │  Password                │            │
│        │  [••••••••••]            │            │
│        │                          │            │
│        │  ☐ Remember me           │            │
│        │                          │            │
│        │  [Login]                 │            │
│        │                          │            │
│        │  Belum punya akun?       │            │
│        │  [Daftar sekarang]       │            │
│        └──────────────────────────┘            │
│                                                │
└────────────────────────────────────────────────┘
```

### Fitur
- Email/Password input dengan validation
- Remember me checkbox
- Link ke registrasi
- Loading state saat submit
- Error messages jika gagal
- Redirect ke dashboard jika sukses

---

## 📝 Register Page (`/auth/register`)

### Layout
```
┌────────────────────────────────────────────────┐
│  D Dandindun   [Theme] [Language]              │
├────────────────────────────────────────────────┤
│                                                │
│            Buat Akun Baru                      │
│         Create New Account                     │
│                                                │
│        ┌──────────────────────────┐            │
│        │  Name                    │            │
│        │  [Full Name]             │            │
│        │                          │            │
│        │  Email                   │            │
│        │  [email@example.com]     │            │
│        │                          │            │
│        │  Password                │            │
│        │  [••••••••••]            │            │
│        │  Min 6 characters        │            │
│        │                          │            │
│        │  Confirm Password        │            │
│        │  [••••••••••]            │            │
│        │                          │            │
│        │  ☐ I agree to Terms      │            │
│        │                          │            │
│        │  [Register]              │            │
│        │                          │            │
│        │  Sudah punya akun?       │            │
│        │  [Masuk di sini]         │            │
│        └──────────────────────────┘            │
│                                                │
└────────────────────────────────────────────────┘
```

### Validasi
- Email format validation
- Password strength meter
- Confirm password matching
- Terms acceptance required

---

## 📊 Dashboard Page (`/dashboard`)

### Header
```
┌────────────────────────────────────────────────┐
│  D Dandindun   [Theme] [Language]   [Avatar▼] │
└────────────────────────────────────────────────┘
```

### Main Content
```
┌──────────────────────────────────────────────────────┐
│  Welcome back, John! 👋                              │
│  Manage your account and access your dashboard      │
├──────────────────────────────────────────────────────┤
│
│  ┌─────────┬──────────┬──────────┐
│  │  Role   │ Status   │ Joined   │
│  │ ADMIN   │ Active   │ 01/01... │
│  └─────────┴──────────┴──────────┘
│
│  ┌──────────────────────────────────────────────┐
│  │  Profile                 [Edit Profile]      │
│  │  Email: admin@example.com                    │
│  │  Name: John Doe                              │
│  └──────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────┐
│  │  Quick Actions                               │
│  │  ┌────────┬────────┬────────┐                │
│  │  │ 👤     │ 🔒     │ 📋     │                │
│  │  │Profile │Security│Activity│                │
│  │  └────────┴────────┴────────┘                │
│  └──────────────────────────────────────────────┘
│
│  ┌────────────────────────────────────────────┐
│  │  🛡️  Admin Dashboard                        │
│  │  Administrator                              │
│  │  ┌────────┬────────┬────────┐               │
│  │  │ 👥    │ 🛡️    │ ⏱️    │               │
│  │  │Users  │ Roles  │Sessions│               │
│  │  ├────────┼────────┼────────┤               │
│  │  │ 🔐    │ 🌍    │ ⚙️    │               │
│  │  │Perms  │Languages│Settings│              │
│  │  └────────┴────────┴────────┘               │
│  │  [Go to Admin Dashboard →]                  │
│  └────────────────────────────────────────────┘
│
│  ┌────────────────────┬─────────────────────┐
│  │ 💡 Tips & Tricks   │ ✅ Security Check   │
│  │ Keep pwd secure... │ All data encrypted..│
│  └────────────────────┴─────────────────────┘
│
└──────────────────────────────────────────────────────┘
```

### Features
- Greeting dengan nama user
- Quick stats badges
- Profile card
- User actions grid
- Admin panel (untuk admin)
- Info cards

---

## 👤 Profile Page (`/profile`)

### Tabs
```
┌─────────────────────────────────────────────┐
│  My Profile  │  Security  │  Activity      │
└─────────────────────────────────────────────┘
```

#### Tab 1: Profile Information
```
┌────────────────────────────────────┐
│  Edit Profile Information          │
│                                    │
│  Full Name                         │
│  [John Doe]                        │
│                                    │
│  Email                             │
│  [john@example.com]                │
│                                    │
│  Bio                               │
│  [____________]                    │
│                                    │
│  Phone                             │
│  [+1 (555) 000-0000]               │
│                                    │
│  Location                          │
│  [San Francisco, CA]               │
│                                    │
│  Website                           │
│  [https://example.com]             │
│                                    │
│  [Save Changes]  [Cancel]          │
└────────────────────────────────────┘
```

#### Tab 2: Security
```
┌────────────────────────────────────┐
│  Change Password                   │
│                                    │
│  Current Password                  │
│  [••••••••••]                       │
│                                    │
│  New Password                      │
│  [••••••••••]                       │
│                                    │
│  Confirm Password                  │
│  [••••••••••]                       │
│                                    │
│  [Change Password]  [Cancel]       │
└────────────────────────────────────┘
```

#### Tab 3: Activity
```
┌─────────────────────────────────────────────┐
│  Activity Logs                              │
│                                             │
│  08:30 - Login from Chrome (192.168.1.1)  │
│  08:15 - Updated Profile                   │
│  07:45 - Changed Password                  │
│  Yesterday - Login from Safari              │
│  Last Week - Account Created                │
│                                             │
│  [Load More...]                             │
└─────────────────────────────────────────────┘
```

---

## 🛡️ Admin Pages

### Admin Dashboard (`/admin`)
```
┌────────────────────────────────────────────┐
│  Admin Dashboard                           │
│  Manage your application and configuration │
├────────────────────────────────────────────┤
│
│  ┌──────────┬──────────┬──────────┬────────┐
│  │ 100 Users│ 5 Roles  │ 20 Active│System: │
│  │          │          │ Sessions │Operational
│  └──────────┴──────────┴──────────┴────────┘
│
│  Management Modules
│
│  ┌────────┬────────┬────────┐
│  │ 👥    │ 🛡️    │ 🔐    │
│  │ Users │ Roles  │Perms   │
│  └────────┴────────┴────────┘
│  ┌────────┬────────┬────────┐
│  │ ⏱️    │ 🌍    │ ⚙️    │
│  │Sessions│Languages│Settings
│  └────────┴────────┴────────┘
│
└────────────────────────────────────────────┘
```

### Users Management (`/admin/users`)
```
┌──────────────────────────────────────────────────┐
│  User Management                     [+ New User]│
├──────────────────────────────────────────────────┤
│
│  Search: [___________]  Filter: [Role ▼]       │
│
│  ┌──────────────────────────────────────────────┐
│  │ Email           │ Name    │ Role     │ Action│
│  ├──────────────────────────────────────────────┤
│  │ admin@test.com  │ Admin   │ [admin]  │ [🗑] │
│  │ user1@test.com  │ User 1  │ [user]   │ [🗑] │
│  │ user2@test.com  │ User 2  │ [user]   │ [🗑] │
│  │                 │         │          │      │
│  │  ...loading...  │         │          │      │
│  └──────────────────────────────────────────────┘
│
└──────────────────────────────────────────────────┘
```

### Roles Management (`/admin/roles`)
```
┌──────────────────────────────────────────────┐
│  Roles & Permissions              [+ New Role]│
├──────────────────────────────────────────────┤
│
│  ┌──────────────────────────────────────────┐
│  │ Name    │ Description │ Permissions │ Act│
│  ├──────────────────────────────────────────┤
│  │ admin   │ Full access │ manage_all  │ [S]│
│  │ moderator│Moderation  │ manage_... │ [🗑│
│  │ user    │ Standard    │ view_...   │ [S]│
│  └──────────────────────────────────────────┘
│
│  Available Permissions
│  ┌────────────┬────────────┬────────────┐
│  │ manage_users│manage_roles│manage_perms│
│  │ manage_sessions│manage_settings│...│
│  └────────────┴────────────┴────────────┘
│
└──────────────────────────────────────────────┘
```

### Sessions Management (`/admin/sessions`)
```
┌──────────────────────────────────────────────┐
│  Sessions          [Active: 20] [Expired: 5]│
├──────────────────────────────────────────────┤
│
│  ┌──────────────────────────────────────────┐
│  │ User ID │ Email    │ Created  │ Expires  │
│  ├──────────────────────────────────────────┤
│  │ user123 │ user@... │ 08:30 AM │ 11:30 AM│ [🚪]
│  │ user456 │ test@... │ 07:45 AM │ 10:45 AM│ [🚪]
│  └──────────────────────────────────────────┘
│
└──────────────────────────────────────────────┘
```

### Languages Management (`/admin/languages`)
```
┌──────────────────────────────────────────────┐
│  Languages                     [+ Add Language]│
├──────────────────────────────────────────────┤
│
│  ┌──────────────────────────────────────────┐
│  │ Code│ Name      │ Native      │Status    │
│  ├──────────────────────────────────────────┤
│  │ en  │ English   │ English     │ Active ★ │
│  │ id  │ Indonesian│ Bahasa Indo │ Active   │
│  │ es  │ Spanish   │ Español     │ Inactive │
│  │                 │             │ [Add]    │
│  └──────────────────────────────────────────┘
│
└──────────────────────────────────────────────┘
```

### Settings (`/admin/settings`)
```
┌────────────────────────────────────────────┐
│  Application Settings                      │
├────────────────────────────────────────────┤
│
│  Site Information
│  ┌────────────────────────────────────────┐
│  │ Site Name: [Dandindun]                 │
│  │ Site URL: [https://dandindun.local]    │
│  │ Support Email: [support@dandindun...]  │
│  └────────────────────────────────────────┘
│
│  Maintenance
│  ┌────────────────────────────────────────┐
│  │ ☐ Maintenance Mode                     │
│  │ Message: [_____________]               │
│  └────────────────────────────────────────┘
│
│  Security
│  ┌────────────────────────────────────────┐
│  │ Session Duration: [7] days             │
│  │ Password Min Length: [6] chars         │
│  │ ☐ Require Email Verification          │
│  │ ☐ Allow Registration                  │
│  └────────────────────────────────────────┘
│
│  [Save Settings]  [Cancel]
│
└────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Light Mode
```
Background:      #FFFFFF
Foreground:      #000000
Primary:         #3B82F6 (Blue)
Secondary:       #8B5CF6 (Purple)
Muted:          #F3F4F6
Border:         #E5E7EB
```

### Dark Mode
```
Background:      #0F172A
Foreground:      #F1F5F9
Primary:         #3B82F6 (Blue)
Secondary:       #8B5CF6 (Purple)
Muted:          #1E293B
Border:         #334155
```

---

## 📐 Spacing & Typography

### Font Sizes
```
Display:    4.5rem (72px)
H1:         3.75rem (60px)
H2:         3rem (48px)
H3:         1.875rem (30px)
H4:         1.5rem (24px)
Body:       1rem (16px)
Small:      0.875rem (14px)
Tiny:       0.75rem (12px)
```

### Spacing Scale
```
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 48px  (3rem)
```

---

## ✨ Interactive Elements

### Buttons
- **Primary:** Full color, hover darken
- **Secondary:** Outline, hover fill
- **Ghost:** Transparent, hover light bg
- **Destructive:** Red, for delete actions

### Forms
- Smooth transitions
- Clear error messages
- Success feedback
- Loading states
- Disabled states

### Cards
- Subtle shadow
- Hover shadow increase
- Smooth transitions
- Dark mode support

### Modals/Dialogs
- Overlay backdrop
- Center content
- Keyboard support
- Escape to close

---

## 🔄 State Transitions

### Loading
```
┌──────────────────┐
│ ⏳ Loading...     │
│ [Spinner]        │
└──────────────────┘
```

### Success
```
┌──────────────────────┐
│ ✅ Berhasil!         │
│ [Message]            │
└──────────────────────┘
```

### Error
```
┌──────────────────────┐
│ ❌ Error            │
│ [Error message]      │
│ [Retry]              │
└──────────────────────┘
```

---

## 📱 Mobile Optimization

### Breakpoints
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px
- **2xl:** 1536px

### Mobile Navigation
- Hamburger menu on small screens
- Stack layouts vertically
- Touch-friendly buttons (48px min)
- Large text for readability

---

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- Focus indicators
- Alt text for images
- Color contrast ratios
- Semantic HTML
- ARIA labels

---

## 🚀 Performance

- Lazy loading images
- Code splitting per page
- Optimized CSS
- Minimal JavaScript
- Static generation where possible
- Responsive images

---

**Last Updated:** 2024  
**Status:** ✅ Design Complete & Implemented
