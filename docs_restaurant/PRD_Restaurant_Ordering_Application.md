**PRODUCT REQUIREMENTS DOCUMENT**

**Restaurant Ordering Application**

*Platform Pemesanan Restoran Full-Stack --- Website, Online Ordering, Akun Pelanggan, Manajemen Dapur, dan Administrasi*

  ------------------------- -------------------------------------------------
  **Versi Dokumen**         1.0

  **Tanggal**               18 Agustus 2026

  **Status**                Draft --- untuk peninjauan pemangku kepentingan

  **Disiapkan oleh**        Alip

  **Kategori Produk**       Full-Stack SaaS / E-commerce (F&B)
  ------------------------- -------------------------------------------------

Daftar Isi

1\. Ringkasan Eksekutif

Restaurant Ordering Application adalah platform digital full-stack yang menggabungkan website publik restoran, sistem pemesanan online, akun pelanggan, manajemen pesanan dapur (kitchen board), dan panel administrasi dalam satu produk terintegrasi. Aplikasi ini merupakan sistem produksi (production-grade) dengan data dan backend nyata --- bukan situs statis maupun purwarupa (prototype) berbasis data demo.

Dokumen ini menjabarkan kebutuhan produk (product requirements) yang menjadi acuan bagi tim pengembang, termasuk cakupan fungsional untuk tiga peran utama (pelanggan, staf, admin), persyaratan teknis, arsitektur tingkat tinggi, serta kriteria kualitas dan deliverable proyek.

1.1 Tujuan Produk

-   Menyediakan kanal pemesanan online yang mudah digunakan pelanggan, lengkap dengan kustomisasi menu dan pembayaran digital.

-   Mempercepat alur kerja dapur melalui notifikasi pesanan real-time dan papan status pesanan (kitchen board).

-   Memberikan kontrol penuh kepada admin atas produk, harga, akun, pesanan, dan pengaturan operasional restoran.

-   Membangun fondasi kode yang aman, teruji, dan siap diperluas tanpa perlu membangun ulang (rebuild) di masa depan.

2\. Latar Belakang dan Pernyataan Masalah

Restoran memerlukan satu sistem terpadu yang menghubungkan pengalaman pelanggan (menjelajah menu, memesan, membayar, melacak status pesanan) dengan operasional internal (dapur dan administrasi), tanpa bergantung pada data statis atau proses manual yang rawan kesalahan. Produk ini dirancang untuk menggantikan kombinasi tools terpisah (website statis, catatan manual dapur, spreadsheet admin) dengan satu platform berbasis data real-time.

3\. Ruang Lingkup Produk

3.1 Termasuk dalam Ruang Lingkup

-   Website publik restoran (informasi restoran, menu, gambar produk).

-   Sistem pemesanan online dengan kustomisasi produk dan keranjang belanja (basket).

-   Pembayaran online terintegrasi Stripe.

-   Akun dan sesi pelanggan, staf, dan admin berbasis peran (role-based).

-   Riwayat pesanan dan pelacakan status pesanan bagi pelanggan.

-   Ulasan produk yang hanya dapat diberikan oleh pelanggan yang pernah memesan (order-eligible review).

-   Papan pesanan dapur (kitchen board) dengan notifikasi real-time untuk staf.

-   Panel administrasi penuh: produk, kategori, harga, ketersediaan, akun, pesanan, pelaporan, audit log, dan pengaturan restoran.

-   Desain responsif dan dukungan PWA (Progressive Web App).

3.2 Di Luar Ruang Lingkup (perlu klarifikasi dengan bidder/klien)

-   Desain UI/UX --- perlu dikonfirmasi apakah desain/wireframe disediakan klien atau dirancang oleh developer.

-   Biaya hosting berjalan (billed terpisah; akun Stripe/Neon/hosting dimiliki klien).

-   Dukungan dan pemeliharaan pasca-peluncuran (post-launch support) --- akan ditawarkan terpisah sebagai retainer.

-   Integrasi pihak ketiga di luar Stripe, kecuali disepakati secara khusus.

4\. Pengguna dan Peran (User Roles)

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Peran**              **Deskripsi**                                                   **Akses Utama**
  ---------------------- --------------------------------------------------------------- ----------------------------------------------------------------------------------------------
  Pelanggan (Customer)   Pengunjung situs yang menjelajah menu dan melakukan pemesanan   Website publik, akun pribadi, checkout, riwayat & status pesanan, ulasan

  Staf (Staff)           Personel dapur/operasional yang memproses pesanan masuk         Kitchen board, notifikasi pesanan real-time, update status pesanan

  Admin                  Pengelola restoran dengan kontrol penuh atas sistem             Manajemen produk/kategori/harga, akun pengguna, pesanan, laporan, audit, pengaturan restoran
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

5\. Kebutuhan Fungsional (Functional Requirements)

5.1 Sisi Pelanggan (Customer-Facing)

  ------------------------------------------------------------------------------------------------
  **ID**     **Kebutuhan**                                                         **Prioritas**
  ---------- --------------------------------------------------------------------- ---------------
  CF-01      Menjelajahi informasi restoran dan daftar menu                        Wajib

  CF-02      Mencari dan memfilter item makanan (kategori, kata kunci, dll.)       Wajib

  CF-03      Melihat gambar dan detail lengkap setiap produk                       Wajib

  CF-04      Mengkustomisasi produk (varian, tambahan/extra, opsi)                 Wajib

  CF-05      Menambahkan item ke keranjang (basket)                                Wajib

  CF-06      Checkout dan pembayaran online melalui Stripe                         Wajib

  CF-07      Membuat akun dan login pelanggan                                      Wajib

  CF-08      Melihat riwayat pesanan sebelumnya                                    Wajib

  CF-09      Melacak status pesanan yang sedang berjalan                           Wajib

  CF-10      Memberikan ulasan produk (hanya untuk pesanan yang memenuhi syarat)   Wajib

  CF-11      Pemesanan cepat tanpa akun (Guest Fast Checkout) & Dine-In Scan QR    Wajib
  ------------------------------------------------------------------------------------------------

5.2 Sisi Staf (Staff-Facing)

  ------------------------------------------------------------------------------------------
  **ID**     **Kebutuhan**                                                   **Prioritas**
  ---------- --------------------------------------------------------------- ---------------
  SF-01      Menerima notifikasi pesanan baru secara real-time               Wajib

  SF-02      Melihat pesanan melalui papan pesanan dapur (kitchen board)     Wajib

  SF-03      Mengonfirmasi (acknowledge) dan memperbarui status pesanan      Wajib

  SF-04      Mengelola alur kerja persiapan pesanan (preparation workflow)   Wajib
  ------------------------------------------------------------------------------------------

5.3 Sisi Admin (Admin-Facing)

  ------------------------------------------------------------------------------------------
  **ID**     **Kebutuhan**                                                   **Prioritas**
  ---------- --------------------------------------------------------------- ---------------
  AD-01      Mengelola produk dan kategori menu                              Wajib

  AD-02      Mengubah harga dan ketersediaan produk                          Wajib

  AD-03      Mengelola gambar dan opsi menu                                  Wajib

  AD-04      Mengelola akun pelanggan dan staf                               Wajib

  AD-05      Mengelola dan memantau seluruh pesanan                          Wajib

  AD-06      Melihat laporan dan insight operasional                         Wajib

  AD-07      Memelihara catatan audit (siapa mengubah apa, kapan)            Wajib

  AD-08      Mengelola pengaturan restoran (jam operasional, lokasi, dll.)   Wajib
  ------------------------------------------------------------------------------------------

6\. Kebutuhan Non-Fungsional dan Kualitas Teknis

-   Menggunakan basis data dan API backend nyata --- tidak ada data statis/demo.

-   Validasi input di sisi server (server-side validation) untuk seluruh input pengguna.

-   Kontrol akses berbasis peran (role-based access control) untuk pelanggan, staf, dan admin.

-   Pemeriksaan tipe TypeScript (type checking) harus lulus tanpa error.

-   ESLint harus lulus tanpa pelanggaran (violations).

-   Build produksi Next.js harus berhasil (successful production build).

-   Struktur basis kode (codebase) mendukung perluasan fitur di masa depan tanpa rebuild total.

-   Desain responsif di seluruh breakpoint perangkat, dengan dukungan PWA (installable, offline-aware sesuai kebutuhan).

7\. Arsitektur dan Tumpukan Teknologi (Tech Stack)

  -----------------------------------------------------------------------
  **Lapisan**          **Teknologi**
  -------------------- --------------------------------------------------
  Frontend             Next.js + React + TypeScript

  Backend              Next.js Server-Side API Routes & Server Actions

  Basis Data           PostgreSQL (Neon)

  ORM                  Drizzle ORM

  Autentikasi          Auth.js (NextAuth) dengan Drizzle Database Adapter (RBAC)

  Penyimpanan Media    Cloudinary (Upload & Optimasi Gambar Menu)

  Pembayaran           Stripe (Mendukung mata uang dinamis sesuai Pengaturan Restoran)

  Realtime             Server-Sent Events (SSE) untuk Kitchen Board & Order Tracking

  Hosting              Production web hosting (akun milik klien)

  Kontrol Versi        GitHub

  Mobile               Responsive design + PWA support
  -----------------------------------------------------------------------

8\. Entitas Data Utama (Gambaran Awal)

Bagian ini memberikan gambaran awal entitas data untuk perancangan skema Drizzle/PostgreSQL lebih lanjut pada tahap SRS/desain teknis.

-   User --- menyimpan data akun dengan peran (customer/staff/admin), kredensial, dan status.

-   Category --- kategori menu (mis. Makanan Utama, Minuman, Dessert).

-   Product --- item menu: nama, deskripsi, harga, gambar, ketersediaan, kategori terkait.

-   ProductOption / Extra --- varian dan tambahan yang dapat dipilih pelanggan saat kustomisasi.

-   Order --- pesanan pelanggan: item, opsi terpilih, total harga, status, riwayat perubahan status.

-   OrderItem --- baris item dalam sebuah pesanan, termasuk kustomisasi yang dipilih.

-   Payment --- data transaksi Stripe terkait pesanan (status, referensi transaksi).

-   Review --- ulasan pelanggan, tertaut ke pesanan yang memenuhi syarat (order-eligible).

-   AuditLog --- catatan perubahan data oleh admin/staf (aktor, aksi, entitas, waktu).

-   RestaurantSettings --- jam operasional, lokasi, mata uang/currency default (mis. IDR, USD, EUR), dan pengaturan operasional lainnya.

9\. Alur Pengguna Utama (Key User Flows)

9.1 Alur Pemesanan Pelanggan

1.  Pelanggan menjelajah menu dan memfilter/mencari produk.

2.  Pelanggan membuka detail produk, memilih kustomisasi/extra, dan menambahkan ke keranjang.

3.  Pelanggan melakukan checkout, login/registrasi bila diperlukan.

4.  Pelanggan menyelesaikan pembayaran melalui Stripe.

5.  Sistem membuat pesanan baru dan memicu notifikasi real-time ke staf.

6.  Pelanggan memantau status pesanan hingga selesai, lalu dapat memberikan ulasan.

9.2 Alur Kerja Dapur (Staff)

7.  Staf menerima notifikasi pesanan baru secara real-time pada kitchen board.

8.  Staf mengonfirmasi (acknowledge) pesanan.

9.  Staf memperbarui status pesanan seiring tahap persiapan (mis. diterima → diproses → siap → selesai).

9.3 Alur Administrasi

10. Admin mengelola katalog produk, kategori, harga, dan ketersediaan.

11. Admin mengelola akun pelanggan dan staf, termasuk peran akses.

12. Admin memantau seluruh pesanan dan meninjau laporan operasional.

13. Setiap perubahan data penting tercatat otomatis pada audit log.

10\. Deliverable Proyek

-   Kode sumber lengkap melalui repository GitHub.

-   Lingkungan produksi yang telah di-deploy dan berfungsi.

-   Dokumentasi environment/konfigurasi untuk proses handover.

-   Dokumentasi teknis dasar: setup, gambaran arsitektur, dan keputusan desain kunci.

11\. Kriteria Sukses (Acceptance Criteria)

-   Seluruh kebutuhan fungsional pada Bagian 5 terimplementasi dan dapat diverifikasi dengan data nyata (bukan demo).

-   TypeScript type checking dan ESLint lulus tanpa error pada branch utama.

-   Build produksi Next.js berhasil tanpa kegagalan.

-   Role-based access control terverifikasi: setiap peran hanya dapat mengakses fungsi sesuai izinnya.

-   Alur pembayaran Stripe end-to-end (checkout hingga konfirmasi pesanan) berfungsi pada environment produksi.

-   Notifikasi pesanan real-time diterima staf dalam rentang waktu wajar setelah pesanan dibuat.

-   Aplikasi responsif dan dapat diinstal sebagai PWA pada perangkat mobile.

12\. Hal yang Perlu Diklarifikasi dengan Bidder/Vendor

-   Kepemilikan desain UI/UX: disediakan klien (wireframe/mockup) atau dirancang oleh developer?

-   Harga tetap (fixed price) atau tarif per jam + estimasi jam kerja?

-   Estimasi linimasa penyelesaian proyek.

-   Struktur milestone pembayaran (mis. deposit / midpoint / delivery).

-   Rincian yang termasuk vs tidak termasuk dalam ruang lingkup penawaran.

-   Opsi dan biaya dukungan/pemeliharaan pasca-peluncuran.

-   Pengalaman/portofolio relevan vendor pada aplikasi ordering atau e-commerce full-stack serupa.

13\. Lampiran

Dokumen ini merupakan turunan langsung dari ringkasan spesifikasi proyek (project brief) yang diberikan klien/pemberi kerja, disusun ulang dalam format PRD untuk memudahkan tinjauan pemangku kepentingan dan menjadi dasar penyusunan SRS (Software Requirements Specification) serta desain teknis pada tahap berikutnya.
