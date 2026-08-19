# 15 --- STITCH TO ANTIGRAVITY CODE CONVERSION PROMPT

**Restaurant Ordering Application**  
*Prompt Instruksi Penerjemahan Desain Stitch ke Kode Next.js di Antigravity IDE*  
**Versi:** 1.0  
**Tanggal:** 19 Agustus 2026  

---

## 🎯 Tujuan Prompt Ini

Prompt ini digunakan untuk menginstruksikan Antigravity IDE agar membaca proyek/layar dari **Stitch MCP Server**, mengekstrak Design System dan struktur UI visualnya, lalu menerjemahkannya menjadi komponen **Next.js (App Router) + React + TypeScript + Tailwind CSS** yang fungsional dan terhubung ke backend nyata (Drizzle, Auth.js, SSE, Stripe, Cloudinary).

---

## 📋 Master Prompt: Stitch to Antigravity Implementation

```text
[MASTER PROMPT: APPLY STITCH DESIGN SYSTEM & SCREENS TO CODEBASE]

Sebagai AI Senior Frontend & Full-Stack Engineer di Antigravity IDE, tolong integrasikan dan terapkan seluruh aset desain UI/UX dari Stitch ke dalam basis kode Next.js Restaurant Ordering Application:

1. Ekstraksi Design Tokens dari Stitch (Global Theme):
   - Akses proyek Stitch melalui MCP tool `get_project` / `list_screens`.
   - Ekstrak palet warna ("Warm Obsidian" & "Terracotta Accent" #D9531E, background #F9F6F0, surface #FFFFFF, dark slate #12161A untuk KDS, emerald #10B981 untuk ready status).
   - Ekstrak konfigurasi tipografi (Plus Jakarta Sans untuk heading, Inter untuk body/label) dan corner radius (12px/16px untuk kartu, 8px untuk tombol).
   - Petakan design tokens tersebut ke dalam `tailwind.config.ts` dan `app/globals.css` (CSS variables).

2. Pembuatan Design System Primitives (`components/ui/`):
   - Buat komponen dasar yang reusable sesuai bentuk dan elevasi dari Stitch:
     • Button (Primary Terracotta, Secondary Outline, Ghost, Danger)
     • Card & Container (Level 1 & Level 2 shadows, rounded-xl)
     • Badge & Status Chips (Pill shape: Pending, Confirmed, Preparing, Ready, Dine-in Table)
     • Input, Select, Textarea (Focus ring terracotta, 8px radius)
     • Modal / Drawer (Customization bottom-sheet untuk mobile, centered modal untuk desktop)
     • Skeleton Loader, Toast Notification & Empty State

3. Pembangunan Halaman Sesuai Visual Stitch (Screen by Screen):
   - Publik & Pelanggan:
     • Halaman Beranda (`/`) & Menu (`/menu`): Sticky navbar, category pill bar, food cards grid dengan optimasi Cloudinary.
     • Kustomisasi Menu (`/menu/[slug]`): Drawer modifikasi porsi, level pedas, extra topping, dan kalkulasi total live.
     • Dine-in Table Mode (`/menu?table=XX`): Header konteks meja persis seperti mockup Stitch Prompt 20.
     • Cart & Checkout (`/checkout`): 2-column layout dengan form kartu Stripe dan tombol bayar terkunci.
     • Live Order Tracking (`/orders/[id]`): Stepper visual realtime bertenaga SSE (Server-Sent Events).
   - Staf Dapur:
     • Kitchen Display Board (`/kitchen`): Dark-mode kanban board 4 kolom persis seperti mockup Stitch Prompt 6 dengan badge `[TABLE XX - DINE IN]`.
   - Administrasi:
     • Dashboard (`/admin/dashboard`), Manajemen Menu (`/admin/products`), Manajemen Meja & QR Code (`/admin/tables`), Pengaturan & Mata Uang (`/admin/settings`).

4. Integrasi Logika Data Nyata (Bukan Mock Data):
   - Hubungkan form dan list ke Drizzle ORM queries & Server Actions.
   - Sambungkan auth state ke Auth.js session.
   - Sambungkan live stream SSE ke event broadcaster.

Tolong mulai proses konversi dari Setup Design Tokens (Tailwind) dan Komponen UI Primitif terlebih dahulu!
```

---

## 🛠️ Langkah-Langkah Eksekusi di Antigravity:

1. **Pastikan Project ID Stitch Anda Siap**:
   - Jika Anda sudah memiliki project di Stitch (misal ID: `16149763566557173562` atau yang baru), berikan ID tersebut atau biarkan Antigravity mengambilnya otomatis via MCP `list_projects`.
2. **Kirimkan Prompt**:
   - Cukup salin Master Prompt di atas atau berikan instruksi langsung di chat: *"Terapkan design system dari Stitch dan mulai bangun Batch 1 & 3"*.
3. **Review & Iterate**:
   - Antigravity akan menyusun file konfigurasi Tailwind, membuat komponen UI, dan menghubungkan halaman demi halaman secara rapi.
