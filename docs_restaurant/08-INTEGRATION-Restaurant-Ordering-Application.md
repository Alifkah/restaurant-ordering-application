**08 --- INTEGRATION**

Restaurant Ordering Application --- External Integration Specification\
Version 1.0 --- 18 August 2026

# 1. Integration Scope

PRD secara eksplisit menetapkan Stripe sebagai payment integration dan menyebut integrasi pihak ketiga lain di luar Stripe berada di luar scope kecuali disepakati. fileciteturn0file0L57-L66

# 2. Integration Architecture

> Next.js Application\
> ├── Auth.js (NextAuth + Drizzle Adapter)\
> ├── Stripe Payment (Dynamic Currency via Settings)\
> │ ├── Checkout Session\
> │ └── Webhook Signature Verification\
> ├── Realtime SSE Layer\
> │ ├── Kitchen Board Stream (`/api/realtime/kitchen`)\
> │ └── Order Tracking Stream (`/api/realtime/orders/:id`)\
> ├── Cloudinary Media Integration\
> │ ├── Image Upload & Signed Presets\
> │ └── Automated Format & Quality Transformation CDN\
> └── PostgreSQL / Neon via Drizzle ORM

# 3. Stripe (Multi-Currency Support)

## 3.1 Checkout Flow

> Customer → POST /api/payments/checkout\
> → Fetch Restaurant Settings (Currency & Decimal Rule)\
> → Calculate Order Total in smallest currency unit\
> → Create Stripe Checkout Session (`currency: settings.currency.toLowerCase()`)\
> → Customer pays on Stripe\
> → Stripe sends webhook `checkout.session.completed`\
> → Verify Webhook Signature\
> → Update Payment (`status: paid`, `provider_payment_id`)\
> → Update Order (`status: confirmed`)\
> → Broadcast SSE Event to Kitchen

## 3.2 Dynamic Currency Rules for Stripe

-   **Zero-Decimal Currencies** (misal: IDR, JPY): Nilai nominal dikirim langsung ke Stripe tanpa perkalian 100 (contoh: Rp 50.000 dikirim sebagai `50000`).
-   **Standard Two-Decimal Currencies** (misal: USD, EUR, SGD): Nilai nominal dikalikan 100 ke satuan cent (contoh: $12.50 dikirim sebagai `1250`).
-   Sistem membaca konfigurasi `currency` dan `currency_decimals` dari tabel `restaurant_settings` saat membuat sesi checkout.

## 3.3 Webhook Requirements

-   Verify webhook signature menggunakan `stripe.webhooks.constructEvent`.
-   Process events idempotently (cek apakah payment/order sudah terproses).
-   Persist provider references (`provider_payment_id`, `checkout_session_id`).
-   Do not trust client payment status; webhook adalah single source of truth untuk settlement pembayaran.
-   Handle duplicate webhook delivery safely.

# 4. Realtime Integration (Server-Sent Events)

> Order Mutation (Created / Status Transition)\
> ↓\
> Database Transaction (Drizzle / PostgreSQL)\
> ↓\
> SSE In-Memory Broadcaster / Event Emitter\
> ↓\
> Active SSE Streams:\
> ├── `GET /api/realtime/kitchen` (Staff Kitchen Board)\
> └── `GET /api/realtime/orders/:id` (Customer Order Tracking)\
> ↓\
> Client UI re-renders immediately

-   **Protokol**: HTTP streaming standar (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`).
-   **Koneksi Ringan**: Mendukung native browser `EventSource` API tanpa library berat di sisi frontend.
-   **Reconnect Resilience**: Jika koneksi terputus, browser otomatis mencoba reconnect, dan frontend memicu fetch ulang state terkini dari database sebagai fallback.
-   **Otorisasi**: Stream dapur mewajibkan session STAFF/ADMIN. Stream order pelanggan memvalidasi kepemilikan user ID.

# 5. Database / Neon

-   Application server mengakses PostgreSQL Neon melalui Drizzle ORM menggunakan connection pooling.
-   Migrations dikelola melalui Drizzle Kit (`drizzle-kit generate` & `drizzle-kit migrate`).
-   Production schema changes harus diverifikasi sebelum deployment.

# 6. Image / Media Integration (Cloudinary)

-   **Provider**: Cloudinary.
-   **Upload Flow**: Admin mengunggah gambar produk menu melalui Admin Panel → Backend menghasilkan signed upload parameters (`/api/admin/media/sign`) → Gambar diunggah langsung ke Cloudinary.
-   **Penyimpanan**: URL gambar (`image_url`) dan Cloudinary public ID (`image_public_id`) disimpan di tabel `products`.
-   **Optimasi Pengiriman**: Frontend memanggil transformasi Cloudinary otomatis (`f_auto,q_auto,w_600,c_fill`) untuk efisiensi bandwidth dan loading cepat.
-   **Manajemen Asset**: Ketika gambar produk diganti atau dihapus oleh admin, asset lama di Cloudinary dapat dibersihkan via Cloudinary Admin SDK.

# 7. Integration Error Handling

  ------------------------------------------------------------------------------------------------------
  Integration             Failure                     Application Response
  ----------------------- --------------------------- --------------------------------------------------
  Stripe                  Checkout creation fails     Return payment error; order remains unpaid

  Stripe                  Webhook duplicated          Idempotently ignore already processed event

  Stripe                  Webhook invalid signature   Reject event (HTTP 400) and log security event

  Realtime (SSE)          Connection drops            Client auto-reconnects & refetches DB state

  Cloudinary              Upload failure              Show upload error toast; catalog item unmodified

  Database                Connection failure          Return controlled 500 error; log incident
  ------------------------------------------------------------------------------------------------------

# 8. Environment Variables

> # Database (Neon / PostgreSQL)\
> DATABASE_URL="postgresql://..."\
> \
> # Auth.js (NextAuth)\
> AUTH_SECRET="your-auth-secret"\
> NEXTAUTH_URL="https://your-domain.com"\
> \
> # Cloudinary Media\
> CLOUDINARY_CLOUD_NAME="your-cloud-name"\
> CLOUDINARY_API_KEY="your-api-key"\
> CLOUDINARY_API_SECRET="your-api-secret"\
> \
> # Stripe Payments\
> STRIPE_SECRET_KEY="sk_test_..."\
> STRIPE_WEBHOOK_SECRET="whsec_..."\
> NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."\
> \
> # Application\
> NEXT_PUBLIC_APP_URL="https://your-domain.com"

# 9. Future Integration Policy

Delivery eksternal, integrasi POS fisik, WhatsApp gateway, program loyalitas poin, dan integrasi pihak ketiga lainnya berada di luar ruang lingkup arsitektur awal ini dan baru akan ditambahkan jika disepakati sebagai fase lanjutan.
