# 14 --- BATCH IMPLEMENTATION PROMPTS

**Restaurant Ordering Application**  
*Panduan Prompt Eksekusi Pengkodean Bertahap (Batch Coding Prompts)*  
**Versi:** 1.0  
**Tanggal:** 18 Agustus 2026  

---

## 📋 Daftar Batch Implementasi

1. **Batch 1**: Fondasi Proyek, Tooling & Skema Database (Drizzle + Neon)
2. **Batch 2**: Autentikasi & RBAC (Auth.js + Drizzle Adapter)
3. **Batch 3**: Publik Website, Menu Katalog & Media Cloudinary
4. **Batch 4**: Keranjang Belanja & Mesin Kalkulasi Pesanan
5. **Batch 5**: Integrasi Pembayaran Stripe & Webhook Signature
6. **Batch 6**: Realtime SSE Engine & Kitchen Display Board (KDS)
7. **Batch 7**: Panel Administrasi Lengkap (Katalog, Pesanan, Pengguna, Pengaturan & Audit)
8. **Batch 8**: Ulasan Terverifikasi, PWA, Security Hardening & Pengujian E2E

---

### 🚀 BATCH 1: Fondasi Proyek, Tooling & Skema Database (Phase 0 & 1)

```text
[EXECUTION PROMPT - BATCH 1: FOUNDATION & DATABASE SETUP]

Tolong bangun fondasi awal proyek Restaurant Ordering Application sesuai dengan spesifikasi PRD dan 02-SYSTEM-ARCHITECTURE:

1. Inisialisasi Project & Tooling:
   - Next.js (App Router) + TypeScript + React.
   - Konfigurasi Tailwind CSS (atau Vanilla CSS design tokens) sesuai dengan palet warna "Warm Obsidian / Terracotta" (#D9531E) dan warm sand (#F9F6F0).
   - Setup ESLint dan tsconfig (strict mode).

2. Konfigurasi Database & ORM (Drizzle ORM + Neon PostgreSQL):
   - Pasang drizzle-orm, @neondatabase/serverless, drizzle-kit, dotenv, zod.
   - Buat file koneksi database `db/index.ts`.
   - Implementasikan skema lengkap di `db/schema/` mencakup:
     • users (Auth.js compatible: id, name, email, emailVerified, image, password_hash, role [customer, staff, admin], status)
     • accounts, sessions, verification_tokens (Auth.js Drizzle Adapter)
     • categories (id, name, slug, description, sort_order, is_active)
     • products (id, category_id, name, slug, description, price_minor, currency, image_url, image_public_id, is_available, sort_order)
     • product_options (id, product_id, name, description, price_delta_minor, is_available, sort_order)
     • orders (id, order_number, customer_id [nullable], guest_name, guest_email, guest_phone, table_number, order_type, guest_tracking_token, status [pending, confirmed, preparing, ready, completed, cancelled], subtotal_minor, discount_minor, tax_minor, total_minor, currency, customer_note)
     • order_items (id, order_id, product_id, product_name_snapshot, unit_price_minor, quantity, line_total_minor, note)
     • order_item_options (id, order_item_id, product_option_id, option_name_snapshot, price_delta_minor, quantity)
     • payments (id, order_id, provider, provider_payment_id, checkout_session_id, status [pending, paid, failed, refunded], amount_minor, currency, paid_at)
     • reviews (id, customer_id, product_id, order_id, rating, comment)
     • audit_logs (id, actor_user_id, action, entity_type, entity_id, metadata, created_at)
     • restaurant_settings (id, restaurant_name, location, phone, email, currency, currency_symbol, currency_decimals, timezone, opening_hours, is_accepting_orders)

3. Database Scripting:
   - Buat konfigurasi `drizzle.config.ts`.
   - Buat script seed awal `db/seed.ts` berisi sample kategori, menu makanan, pengaturan default restoran (IDR, Rp, WITA), dan akun default admin/staff/customer.
   - Pastikan script migrasi (`npm run db:generate` dan `npm run db:migrate`) siap dijalankan.
```

---

### 🔐 BATCH 2: Autentikasi & RBAC (Auth.js + Drizzle Adapter) (Phase 2)

```text
[EXECUTION PROMPT - BATCH 2: AUTHENTICATION & RBAC]

Implementasikan sistem autentikasi dan kontrol akses berbasis peran (RBAC) sesuai dengan 06-AUTHENTICATION:

1. Konfigurasi Auth.js / NextAuth v5:
   - Setup Auth.js dengan Drizzle Adapter menggunakan tabel `users`, `accounts`, `sessions`, `verification_tokens`.
   - Konfigurasi Credentials Provider untuk email & password login (verifikasi bcrypt hash).
   - Setup session callback agar menyertakan `id`, `role` (customer/staff/admin), dan `status` ke dalam objek session.

2. Proteksi Rute & Middleware (`middleware.ts`):
   - Lindungi rute `/account/*` dan riwayat `/orders/*` untuk customer yang terautentikasi (dengan fallback akses token untuk guest tracking).
   - Lindungi rute `/kitchen/*` dan `/api/realtime/kitchen` khusus untuk role STAFF dan ADMIN.
   - Lindungi rute `/admin/*` dan `/api/admin/*` khusus untuk role ADMIN.
   - Redirect otomatis jika belum login atau jika role tidak sesuai (403 Forbidden).

3. Halaman & Komponen Autentikasi:
   - Halaman `/login` dan `/register` dengan desain clean, tab switch, validasi form Zod, dan alert error yang ramah pengguna.
   - Server Actions / Route Handlers untuk registrasi customer baru (`/api/auth/register`) yang memvalidasi input, menghash password, dan mencegah duplikasi email.
```

---

### 🍽️ BATCH 3: Publik Website, Menu Katalog & Media Cloudinary (Phase 3 & 4)

```text
[EXECUTION PROMPT - BATCH 3: PUBLIC SITE, MENU & CLOUDINARY]

Bangun antarmuka publik restoran dan modul katalog menu makanan sesuai dengan PRD dan 07-UI-UX:

1. Layout Publik & Beranda (`/` dan `/about`):
   - Navbar sticky responsif dengan logo, menu navigasi, status buka/tutup restoran real-time, dan ikon keranjang belanja melayang dengan badge counter.
   - Hero banner memikat dengan tombol CTA "Explore Menu" dan "Track Order".
   - Seksi "Chef Recommendations", info jam operasional & lokasi, serta footer informatif.
   - Halaman `/about` berisi profil kisah kuliner, peta, dan jam buka.

2. Katalog Menu Interaktif (`/menu`):
   - Search bar dengan live search/filter instan.
   - Tab navigasi kategori horizontal yang sticky.
   - Grid kartu menu dengan gambar makanan responsif, badge (Best Seller, Pedas), harga terformat dinamis, dan tombol "+ Customize / Add".

3. Modal / Drawer Kustomisasi Menu (`/menu/[slug]`):
   - Tampilan modal/drawer detail hidangan.
   - Pilihan ukuran porsi (radio), level pedas (segmented control), extra toppings (checkbox), dan kolom catatan instruksi khusus.
   - Tombol "Add to Basket" dengan kalkulasi subtotal instan secara reaktif.

4. Integrasi Media Cloudinary:
   - Setup Cloudinary helper di `lib/cloudinary.ts`.
   - Komponen image wrapper yang otomatis menerapkan optimasi format dan kompresi WebP/AVIF (`f_auto,q_auto`).
```

---

### 🛒 BATCH 4: Keranjang Belanja, Guest Checkout & Kalkulasi Pesanan (Phase 5 & 6)

```text
[EXECUTION PROMPT - BATCH 4: CART, GUEST CHECKOUT & ORDER PROCESSING ENGINE]

Implementasikan manajemen keranjang belanja, alur Guest Fast Checkout, dan mesin pemrosesan pesanan sesuai dengan 03-DATABASE-SCHEMA dan 05-API-SPECIFICATION:

1. Client Cart Management:
   - Buat Cart Context / Zustand store untuk menampung item keranjang, opsi kustomisasi, catatan item, nomor meja (`table_number`), dan kuantitas dengan sinkronisasi LocalStorage.
   - Drawer / Halaman Keranjang (`/cart` & `/checkout`) dengan tab switch: "⚡ Fast Guest Checkout" (Form: Nama, No. WhatsApp, Email) vs "Sign In Account".

2. Server-Authoritative Price Calculation (`domain/order-calculator.ts`):
   - Fungsi server-side untuk menghitung ulang subtotal, pajak, dan total pesanan murni dari database (menolak harga yang dikirim dari browser).
   - Format mata uang dinamis (`lib/currency.ts`) yang membaca simbol, desimal, dan kode mata uang dari `restaurant_settings`.

3. Pembuatan Pesanan (`POST /api/orders`):
   - Validasi payload pesanan (Zod schema) yang mendukung pesanan Authenticated ATAU Guest (dengan `guestInfo`, `tableNumber`, dan `orderType`).
   - Transaksi database: simpan snapshot nama dan harga produk ke `order_items` dan `order_item_options`, isi `guest_tracking_token` jika memesan sebagai guest.
   - Generate nomor pesanan unik (misal `#ORD-YYYYMMDD-XXX`) dengan status awal `PENDING`.
```

---

### 💳 BATCH 5: Integrasi Pembayaran Stripe & Webhook Lifecycle (Phase 7)

```text
[EXECUTION PROMPT - BATCH 5: STRIPE PAYMENTS & WEBHOOKS]

Implementasikan alur pembayaran online multi-currency menggunakan Stripe sesuai dengan 08-INTEGRATION:

1. Stripe Checkout Session (`POST /api/payments/checkout`):
   - Setup Stripe SDK di `lib/stripe.ts`.
   - Ambil data order dan aturan mata uang dari `restaurant_settings`.
   - Konversi nominal uang secara presisi (membedakan zero-decimal seperti IDR/JPY dengan decimal currency seperti USD/EUR).
   - Buat sesi Stripe Checkout dengan URL sukses (`/checkout/success?session_id={CHECKOUT_SESSION_ID}`) dan batal (`/checkout/cancel`).
   - Simpan `checkout_session_id` ke tabel `payments`.

2. Stripe Webhook Handler (`POST /api/webhooks/stripe`):
   - Verifikasi cryptographic webhook signature menggunakan `STRIPE_WEBHOOK_SECRET`.
   - Tangani event `checkout.session.completed` secara idempotent:
     • Update status pembayaran menjadi `paid` dan catat `paid_at`.
     • Update status pesanan dari `pending` menjadi `confirmed`.
     • Picu notifikasi realtime ke antrean dapur.

3. Halaman Hasil Pembayaran:
   - Halaman `/checkout/success`: Menampilkan nomor pesanan, detail pembayaran, dan tombol CTA "Track Order in Real-Time".
   - Halaman `/checkout/cancel`: Alert ramah pengguna dengan tombol "Coba Lagi" dan keranjang yang tetap tersimpan.
```

---

### 👨‍🍳 BATCH 6: Realtime SSE Engine & Kitchen Display Board (Phase 8 & 9)

```text
[EXECUTION PROMPT - BATCH 6: REALTIME SSE & KITCHEN BOARD]

Bangun sistem notifikasi dapur realtime berbasis Server-Sent Events (SSE) sesuai dengan 02-SYSTEM-ARCHITECTURE dan 08-INTEGRATION:

1. SSE Event Broadcaster (`lib/realtime/sse-broadcaster.ts`):
   - Event emitter in-memory untuk streaming pembaruan status pesanan.
   - Endpoint SSE Staf Dapur: `GET /api/realtime/kitchen` (memeriksa sesi staff/admin).
   - Endpoint SSE Pelacakan Pelanggan: `GET /api/realtime/orders/:id` (memverifikasi kepemilikan order).

2. Kitchen Display Board (`/kitchen`):
   - UI Kanban full-screen dark mode (`#12161A`) dengan 4 kolom: PENDING, CONFIRMED, PREPARING, READY.
   - Kartu tiket pesanan dengan timer berjalan (indikator warna hijau/kuning/merah), rincian item dengan teks tebal, dan highlight khusus untuk catatan modifikasi menu.
   - Notifikasi audio chime saat ada pesanan baru masuk.
   - Tombol aksi cepat: "Acknowledge" (ubah ke Confirmed/Preparing) dan "Ready for Pickup".

3. Live Order Tracking Pelanggan (`/orders/[id]`):
   - Stepper status visual realtime: Placed → Confirmed → Preparing → Ready → Completed.
   - Auto-reconnect resilience: jika koneksi internet terputus, otomatis menyambung kembali dan memvalidasi state terbaru dari database.
```

---

### 💼 BATCH 7: Panel Administrasi Lengkap (Phase 10)

```text
[EXECUTION PROMPT - BATCH 7: ADMIN CONTROL PANEL]

Bangun panel administrasi terpadu untuk pengelola restoran sesuai dengan PRD dan 05-API-SPECIFICATION:

1. Layout & Executive Dashboard (`/admin/dashboard`):
   - Sidebar navigasi admin responsif.
   - Kartu ringkasan KPI: Omset Hari Ini, Total Pesanan, Rata-rata Nilai Transaksi, dan Waktu Persiapan Dapur.
   - Grafik tren penjualan dan tabel live queue pesanan yang sedang aktif.

2. Manajemen Menu & Kategori (`/admin/products` dan `/admin/categories`):
   - CRUD Kategori dengan drag-and-drop sort order dan toggle aktif/sembunyi.
   - Data table produk lengkap dengan thumbnail Cloudinary, toggle ketersediaan instan, dan rating ulasan.
   - Drawer "Tambah/Edit Menu" dengan dropzone upload gambar Cloudinary (signed upload) dan builder varian/opsi dinamis.

3. Manajemen Pesanan Master & Pengguna (`/admin/orders` dan `/admin/users`):
   - Tabel master seluruh pesanan dengan filter tanggal, pencarian nomor pesanan, dan filter multi-status.
   - Manajemen akun pelanggan dan staf dapur: ganti peran (role), reset password, atau suspend akun.

4. Pengaturan Restoran & Audit Trail (`/admin/settings` dan `/admin/audit-logs`):
   - Form pengaturan restoran: Master toggle terima pesanan, jadwal jam operasional mingguan, dan pemilih mata uang dinamis (IDR, USD, EUR, SGD).
   - Tabel Audit Log yang mencatat setiap perubahan data penting (aktor, aksi, timestamp, dan diff perubahan data).
```

---

### 🛡️ BATCH 8: Verified Reviews, PWA, Security & Pengujian E2E (Phase 11-16)

```text
[EXECUTION PROMPT - BATCH 8: REVIEWS, PWA, SECURITY & TESTING]

Selesaikan fitur ulasan terverifikasi, optimasi PWA, pengamanan sistem, dan pengujian kualitas sesuai dengan 10-SECURITY dan 11-TESTING:

1. Modul Ulasan Terverifikasi (`/api/reviews`):
   - Validasi eligibility: ulasan hanya bisa dikirim oleh customer yang memiliki pesanan berstatus `completed` yang memuat produk tersebut.
   - Modal rating bintang 1-5 dan komentar pada halaman selesai pesanan.
   - Tampilkan agregat rating dan ulasan pada halaman detail menu.

2. PWA & Asset Offline:
   - Konfigurasi `manifest.json`, icon PWA, tema warna, dan service worker dasar.
   - Halaman `404 Not Found` estetik bertema kuliner dan banner offline toast saat jaringan terputus.

3. Security Hardening:
   - Pasang rate limiting pada endpoint sensitif (login, register, checkout).
   - Pastikan header keamanan HTTP (CSP, X-Frame-Options) terpasang.
   - Sanitasi input dan proteksi CSRF.

4. Pengujian & Verifikasi Kualitas:
   - Unit tests untuk kalkulator pesanan, konversi mata uang, dan state machine status.
   - Integration tests untuk alur checkout Stripe, webhook signature, dan SSE stream.
   - Verifikasi build produksi (`npm run build`), TypeScript type checking (`tsc --noEmit`), dan ESLint.
```
