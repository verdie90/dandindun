# 🎯 Halaman Admin Dandindun

Dokumentasi lengkap untuk semua halaman admin dan modul manajemen.

## 📋 Daftar Halaman Admin

### 1. 🏠 Admin Dashboard (`/admin`)
**URL:** `/[locale]/admin`

Dashboard utama yang menampilkan:
- Statistik sistem (Total User, Total Role, Active Sessions)
- Status aplikasi (Operational/Maintenance)
- Akses cepat ke semua modul manajemen
- Quick links ke halaman penting

**Permission:** `admin` role

---

### 2. 👥 User Management (`/admin/users`)
**URL:** `/[locale]/admin/users`

Kelola akun pengguna dan peran mereka:

**Fitur:**
- ✅ Daftar semua pengguna
- ✅ Cari pengguna berdasarkan email/nama
- ✅ Ubah peran pengguna (admin, moderator, user)
- ✅ Deaktifkan/aktifkan pengguna
- ✅ Lihat detail pengguna
- ✅ Hapus pengguna

**Tabel Kolom:**
| Kolom | Deskripsi |
|-------|-----------|
| Email | Email pengguna |
| Nama | Nama lengkap pengguna |
| Role | Peran (admin, moderator, user) |
| Status | Aktif/Nonaktif |
| Aksi | Edit, Ubah Role, Hapus |

**Permission:** `manage_users`

**Service:** `lib/user-service.ts`

---

### 3. 🛡️ Role Management (`/admin/roles`)
**URL:** `/[locale]/admin/roles`

Kelola peran sistem dan izin mereka:

**Fitur:**
- ✅ Lihat semua peran
- ✅ Buat peran kustom
- ✅ Tetapkan izin ke peran
- ✅ Edit peran
- ✅ Hapus peran kustom
- ✅ Lindungi peran sistem

**Peran Default:**
```
Admin        - Akses penuh sistem
Moderator    - Moderasi konten & pengguna
User         - Izin standar
```

**Fitur Tambahan:**
- Pratinjau izin di tabel
- Dialog untuk membuat/edit peran
- Checkbox untuk pemilihan izin
- Badge untuk peran sistem vs kustom

**Permission:** `manage_roles`

**Service:** `lib/role-permission-service.ts`

---

### 4. 🔐 Permission Management (`/admin/permissions`)
**URL:** `/[locale]/admin/permissions`

Kelola izin sistem dan kategorisasi:

**Fitur:**
- ✅ Lihat semua izin (terorganisir per kategori)
- ✅ Buat izin kustom
- ✅ Tambah kategori baru
- ✅ Hapus izin
- ✅ Lihat deskripsi izin

**Kategori Izin:**
```
Users       - Kelola pengguna
Roles       - Kelola peran
Permissions - Kelola izin
Sessions    - Kelola sesi
Settings    - Konfigurasi aplikasi
Content     - Kelola konten
Analytics   - Akses analitik
System      - Operasi sistem
```

**Izin Tersedia:**
- `manage_users` - Kelola semua pengguna
- `manage_roles` - Kelola semua peran
- `manage_permissions` - Kelola semua izin
- `manage_sessions` - Kelola sesi pengguna
- `manage_settings` - Konfigurasi aplikasi
- `create_content` - Buat konten
- `edit_content` - Edit konten
- `delete_content` - Hapus konten

**Permission:** `manage_permissions`

**Service:** `lib/role-permission-service.ts`

---

### 5. ⏱️ Session Management (`/admin/sessions`)
**URL:** `/[locale]/admin/sessions`

Pantau dan kelola sesi pengguna aktif:

**Fitur:**
- ✅ Lihat sesi aktif
- ✅ Lihat sesi kedaluwarsa
- ✅ Statistik sesi (Aktif/Kedaluwarsa)
- ✅ Paksa pengguna logout
- ✅ Lihat detail sesi (User ID, Email, Waktu)
- ✅ Auto-cleanup sesi kedaluwarsa

**Informasi Sesi:**
- User ID & Email
- Waktu Dibuat
- Waktu Kadaluarsa
- Status (Aktif/Kedaluwarsa)
- Aksi Terminate

**Konfigurasi:**
- Durasi sesi: 7 hari (dapat dikonfigurasi)
- Auto-cleanup: Opsional
- Last activity tracking: ✅

**Permission:** `manage_sessions`

**Service:** `lib/session-service.ts`

---

### 6. 🌍 Language Management (`/admin/languages`)
**URL:** `/[locale]/admin/languages`

Kelola bahasa yang didukung aplikasi:

**Fitur:**
- ✅ Instalasi bahasa baru
- ✅ Aktifkan/nonaktifkan bahasa
- ✅ Atur bahasa default
- ✅ Hapus bahasa
- ✅ Lihat bahasa terinstal

**Bahasa Tersedia:**
- English (en) 🇬🇧
- Indonesian (id) 🇮🇩
- Spanish (es) 🇪🇸
- French (fr) 🇫🇷
- German (de) 🇩🇪
- Portuguese (pt) 🇵🇹
- Russian (ru) 🇷🇺
- Chinese (zh) 🇨🇳
- Japanese (ja) 🇯🇵
- Korean (ko) 🇰🇷

**Tabel Kolom:**
| Kolom | Deskripsi |
|-------|-----------|
| Kode | Kode bahasa (en, id, dll) |
| Nama | Nama bahasa Inggris |
| Nama Asli | Nama dalam bahasa asli |
| Status | Aktif/Nonaktif |
| Default | Bahasa default sistem |
| Aksi | Atur Default, Hapus |

**Permission:** `manage_settings`

**Service:** `lib/settings-service.ts`

---

### 7. ⚙️ Application Settings (`/admin/settings`)
**URL:** `/[locale]/admin/settings`

Konfigurasi pengaturan aplikasi global:

**Bagian Pengaturan:**

#### A. Informasi Situs
- Nama situs (Dandindun)
- Deskripsi situs
- URL situs
- Email dukungan
- Logo & Favicon (future)

#### B. Mode Pemeliharaan
- Toggle mode pemeliharaan
- Pesan khusus untuk pengguna
- Hanya admin dapat mengakses

#### C. Sesi & Keamanan
- Durasi sesi maksimum (1-365 hari)
- Panjang password minimum (4-32 karakter)
- Verifikasi email diperlukan (toggle)
- Kebijakan password (future)

#### D. Pendaftaran
- Izinkan pendaftaran publik (toggle)
- Jika dinonaktifkan: Hanya admin yang dapat membuat akun

**Pengaturan Default:**
```javascript
{
  siteName: "Dandindun",
  siteDescription: "Multi-language Application with RBAC",
  siteUrl: "https://dandindun.local",
  supportEmail: "support@dandindun.local",
  maintenanceMode: false,
  maxSessionDuration: 7,
  passwordMinLength: 6,
  requireEmailVerification: false,
  allowRegistration: true
}
```

**Permission:** `manage_settings`

**Service:** `lib/settings-service.ts`

---

## 🗂️ Struktur Folder Admin

```
app/[locale]/admin/
├── page.tsx                 # Dashboard utama
├── users/
│   └── page.tsx            # Manajemen pengguna
├── roles/
│   └── page.tsx            # Manajemen peran
├── permissions/
│   └── page.tsx            # Manajemen izin
├── sessions/
│   └── page.tsx            # Manajemen sesi
├── languages/
│   └── page.tsx            # Manajemen bahasa
└── settings/
    └── page.tsx            # Pengaturan aplikasi
```

---

## 🔒 Kontrol Akses

Semua halaman admin memerlukan:

1. **Autentikasi:** Login terlebih dahulu
2. **Otorisasi:** Peran `admin`
3. **Izin Spesifik:** Izin sesuai modul

### Pemeriksaan Izin

```tsx
const { checkRole } = usePermission();

useEffect(() => {
  if (!checkRole("admin")) {
    router.push("/dashboard");
  }
}, [checkRole, router]);
```

---

## 📊 Alur Data

```
User Login
  ↓
Session Created
  ↓
Check Role (Admin?)
  ↓
Check Permission (manage_*)
  ↓
Load Admin Page
  ↓
Fetch Data from Firestore
  ↓
Display in UI
  ↓
User Action (Create/Edit/Delete)
  ↓
Update Firestore
  ↓
Refresh UI with New Data
```

---

## 🚨 Error Handling

Setiap halaman admin memiliki:

- ✅ Error alerts (atas halaman)
- ✅ Success messages (auto-dismiss)
- ✅ Loading states (spinner)
- ✅ Validation errors (form)
- ✅ Confirmation dialogs (delete)
- ✅ Empty states (tidak ada data)

---

## 📱 Responsive Design

Semua halaman admin responsive untuk:
- ✅ Desktop (≥1024px)
- ✅ Tablet (768px-1023px)
- ✅ Mobile (≤767px)

---

## 🎨 Komponen UI Digunakan

Setiap halaman menggunakan:
- `Card` - Kontainer konten
- `Table` - Daftar data
- `Button` - Aksi
- `Dialog` - Form modal
- `Input/Textarea` - Input form
- `Select` - Dropdown
- `Badge` - Label status
- `Alert` - Pesan feedback
- `Spinner` - Loading indicator

---

## 🔄 Operasi CRUD

### Create
```
Dialog Form
  ↓
Validasi Input
  ↓
Kirim ke Service
  ↓
Simpan ke Firestore
  ↓
Update State Local
  ↓
Tampilkan Success Alert
```

### Read
```
Load Page
  ↓
Fetch Data dari Firestore
  ↓
Set State
  ↓
Render UI
```

### Update
```
Edit Dialog
  ↓
Ubah Values
  ↓
Submit Form
  ↓
Update di Firestore
  ↓
Update State
  ↓
Tampilkan Success Alert
```

### Delete
```
Klik Delete
  ↓
Confirmation Dialog
  ↓
Delete dari Firestore
  ↓
Update State
  ↓
Refresh List
```

---

## 📝 Best Practices

### Untuk Administrators ✅

- [ ] Review sesi secara berkala
- [ ] Gunakan prinsip least privilege
- [ ] Pantau aktivitas pengguna
- [ ] Update pengaturan keamanan
- [ ] Backup data secara rutin
- [ ] Periksa peranan permission

### Untuk Developers 🧑‍💻

- [ ] Selalu cek autentikasi
- [ ] Validasi izin di setiap aksi
- [ ] Gunakan try-catch untuk async
- [ ] Tampilkan error ke user
- [ ] Refresh data setelah operasi
- [ ] Unit test CRUD operations

---

## 🐛 Troubleshooting

### "Akses Ditolak"
```
1. Pastikan login dengan akun admin
2. Cek role di profile: /profile
3. Minta admin untuk memberikan role admin
4. Clear cache browser
```

### "Halaman Tidak Dimuat"
```
1. Cek koneksi internet
2. Buka console: F12
3. Cari error message
4. Refresh halaman
5. Coba login ulang
```

### "Data Tidak Tersimpan"
```
1. Cek form validation
2. Cek network (F12 → Network)
3. Periksa Firestore connection
4. Coba lagi setelah beberapa detik
```

---

## 🔗 Referensi Cepat

| Halaman | URL | Permission | Service |
|---------|-----|-----------|---------|
| Dashboard | `/admin` | admin | - |
| Users | `/admin/users` | manage_users | user-service |
| Roles | `/admin/roles` | manage_roles | role-permission-service |
| Permissions | `/admin/permissions` | manage_permissions | role-permission-service |
| Sessions | `/admin/sessions` | manage_sessions | session-service |
| Languages | `/admin/languages` | manage_settings | settings-service |
| Settings | `/admin/settings` | manage_settings | settings-service |

---

## 📚 Dokumentasi Lengkap

- [Admin Management Docs](./ADMIN_MANAGEMENT_DOCS.md) - Detail teknis
- [Admin Quick Start](./ADMIN_QUICKSTART.md) - Panduan cepat
- [Auth & RBAC Docs](./AUTH_RBAC_DOCS.md) - Sistem auth
- [Multi-Language Setup](./MULTILANG_SETUP.md) - i18n setup
- [Completion Summary](./COMPLETION_SUMMARY.md) - Ringkasan proyek

---

## ✨ Fitur Bonus

- 🎨 Dark/Light theme support
- 🌍 Multi-bahasa (EN/ID)
- 📱 Responsive design
- ♿ Accessibility friendly
- 🚀 TypeScript strict mode
- 🔐 Security first

---

**Status:** ✅ Production Ready  
**Versi:** 1.0.0  
**Last Updated:** 2024
