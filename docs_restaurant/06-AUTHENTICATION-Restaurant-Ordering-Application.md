**06 --- AUTHENTICATION**

Restaurant Ordering Application --- Authentication & Authorization Specification\
Version 1.0 --- 18 August 2026

# 1. Scope

Dokumen ini mendefinisikan authentication, session, role-based access control (RBAC), protected routes, dan authorization untuk CUSTOMER, STAFF, dan ADMIN. PRD mensyaratkan akun dan sesi untuk ketiga role serta RBAC. fileciteturn0file0L45-L56

# 2. Roles

  ---------------------------------------------------------------------------------------------------------------
  Role                                Primary Access
  ----------------------------------- ---------------------------------------------------------------------------
  CUSTOMER                            Public website, account, checkout, order history/status, eligible reviews

  STAFF                               Kitchen board, realtime notifications, acknowledge/update order status

  ADMIN                               Products, categories, prices, users, orders, reports, audit, settings
  ---------------------------------------------------------------------------------------------------------------

# 3. Authentication Flow (Auth.js / NextAuth + Drizzle Adapter)

> Register → Validate Input → Hash Password (bcrypt) → Insert User into DB (Role: CUSTOMER)\
> \
> Login → Validate Credentials via Auth.js Credentials Provider → Verify Password Hash → Create Session in DB (Drizzle Session Adapter) → Set HTTP-Only Cookie\
> \
> Request → Next.js Middleware / Server Action → Read Session via `auth()` → Extract User & Role → RBAC Authorization → Execute Use Case

# 4. Session Architecture (Auth.js Database Strategy)

-   Menggunakan **Auth.js (NextAuth v5)** dengan **Drizzle Adapter** yang terhubung langsung ke PostgreSQL (tabel `users`, `accounts`, `sessions`, `verification_tokens`).
-   Session disimpan di database (`sessions` table) dan diidentifikasi via secure, HTTP-only cookie.
-   Role pengguna (`customer`, `staff`, `admin`) disertakan dalam session object melalui callback `session({ session, user })` sehingga dapat diakses secara efisien pada server components, route handlers, dan server actions.
-   Session memiliki expiry otomatis dan di-revoke dari database saat logout (`POST /api/auth/signout`).
-   Client UI tidak boleh menjadi sumber kebenaran authorization; setiap server mutation memvalidasi session dan role langsung di backend.

# 5. Route Protection & Middleware

> `/account/*` → CUSTOMER (Protected by Middleware & Server Component)\
> `/orders/*` → CUSTOMER / STAFF / ADMIN sesuai kepemilikan dan endpoint\
> `/kitchen/*` → STAFF / ADMIN (Protected by Middleware)\
> `/admin/*` → ADMIN (Protected by Middleware)\
> `/api/admin/*` → ADMIN (Protected by Route Handler Authorization Check)\
> `/api/realtime/kitchen` → STAFF / ADMIN (SSE Authorization)\
> `/api/realtime/orders/:id` → CUSTOMER (Owner) / STAFF / ADMIN

# 6. Authorization Matrix

  -----------------------------------------------------------------------------
  Capability              Customer          Staff             Admin
  ----------------------- ----------------- ----------------- -----------------
  Browse catalog          ✓                 ✓                 ✓

  Manage cart             ✓                 ---               ---

  Checkout/payment        ✓                 ---               ---

  View own orders         ✓                 ---               ---

  Kitchen board (SSE)     ---               ✓                 ✓

  Update kitchen status   ---               ✓                 ✓

  Manage products/media   ---               ---               ✓

  Manage users            ---               ---               ✓

  Reports                 ---               Operational       ✓

  Audit logs              ---               ---               ✓

  Restaurant settings     ---               ---               ✓
  -----------------------------------------------------------------------------

# 7. Authorization Rules

-   Customer hanya dapat membaca dan melacak order miliknya sendiri (`order.customer_id === session.user.id`).
-   Staff hanya dapat membuka kitchen board, menerima stream SSE dapur, dan memperbarui status operasional pesanan.
-   Admin memiliki hak akses penuh atas manajemen katalog, konfigurasi Cloudinary, penetapan peran pengguna, pengaturan mata uang/restoran, dan peninjauan audit log.
-   Pemeriksaan otorisasi dilakukan di sisi server pada setiap mutasi data (Server Actions / Route Handlers).
-   Perubahan role/status user hanya boleh dilakukan oleh Admin.

## 7.1 Guest Checkout & Order Tracking Architecture

-   **Pemesanan Cepat (Guest)**: Pengguna tidak diwajibkan login/registrasi sebelum memesan. Pengguna cukup memasukkan Nama, Email/WhatsApp, dan Nomor Meja saat checkout.
-   **Guest Tracking Token**: Saat order guest dibuat, server menghasilkan `guest_tracking_token` (kriptografis acak) yang disimpan di database dan di-embed ke URL pelacakan (misal: `/orders/ORD-042?token=xyz...`) atau disimpan di cookie browser sementara.
-   **Otorisasi Pelacakan Guest**: Endpoint status `/api/orders/:id/status` dan `/api/realtime/orders/:id` mengizinkan akses jika request memiliki session pemilik ATAU query parameter `token` yang cocok dengan `guest_tracking_token`.
-   **Konversi Akun (Seamless Account Claiming)**: Pada halaman sukses/pelacakan order, guest diberikan opsi: *"Ingin simpan riwayat ini? Cukup buat password"*. Jika guest mendaftar dengan email yang sama, sistem otomatis menautkan pesanan-pesanan guest masa lalunya ke `users.id` akun baru tersebut.

# 8. Authentication Endpoints

  -------------------------------------------------------------------------------------------------------
  Method                  Endpoint                     Purpose
  ----------------------- ---------------------------- --------------------------------------------------
  POST                    /api/auth/register           Register customer (validasi input + password hash)

  ALL                     /api/auth/[...nextauth]      Auth.js core handler (login, CSRF, provider callback)

  POST                    /api/auth/signout            Revoke session and clear HTTP-only cookies

  GET                     /api/auth/session            Return current authenticated session & role
  -------------------------------------------------------------------------------------------------------

# 9. Account Security

-   Password wajib di-hash menggunakan algoritma yang kuat (bcrypt / argon2) sebelum disimpan ke kolom `password_hash`.
-   Kolom `password_hash` dikecualikan secara eksplisit dari model return query pengguna.
-   Rate limiting diterapkan pada endpoint register dan login untuk memitigasi serangan brute force.
-   Auth.js menangani token CSRF dan mitigasi session hijacking secara otomatis.
-   Setiap tindakan kritis (perubahan role/status pengguna, reset password, update pengaturan restoran) tercatat dalam `audit_logs`.

# 10. Authentication Acceptance Criteria

-   Customer dapat registrasi, login melalui Credentials Provider Auth.js, dan logout dengan aman.
-   Session tersimpan di tabel `sessions` PostgreSQL melalui Drizzle Adapter.
-   Protected route dan API route menolak unauthenticated request (401) dan unauthorized role (403).
-   Customer tidak dapat mengakses data pesanan customer lain.
-   Staff tidak dapat membuka halaman atau API khusus admin.
-   Admin dapat mengelola pengguna dan mengubah role/status.
