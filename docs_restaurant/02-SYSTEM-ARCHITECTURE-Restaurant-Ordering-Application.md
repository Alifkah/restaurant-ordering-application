**SYSTEM ARCHITECTURE**

**Restaurant Ordering Application**

Technical Architecture Specification\
Version 1.0\
18 August 2026

*Basis: PRD --- Restaurant Ordering Application*

# 1. Tujuan Dokumen

Dokumen ini mendefinisikan arsitektur teknis untuk Restaurant Ordering Application berdasarkan PRD versi 1.0. Arsitektur dirancang untuk mendukung website publik restoran, online ordering, akun pelanggan, kitchen board, administrasi, pembayaran Stripe, real-time order notification, dan PWA.

PRD menetapkan aplikasi sebagai platform full-stack production-grade dengan backend dan data nyata, bukan situs statis atau prototype berbasis data demo.

# 2. Architectural Goals

-   Menyediakan satu platform terpadu untuk customer, staff, dan admin.

-   Memastikan seluruh transaksi dan data menggunakan backend/database nyata.

-   Mendukung payment flow Stripe end-to-end.

-   Mendukung kitchen board dengan notifikasi order secara real-time.

-   Menerapkan role-based access control untuk customer, staff, dan admin.

-   Menjaga codebase modular agar dapat diperluas tanpa rebuild total.

-   Mendukung responsive web dan PWA.

-   Menjaga type safety, validation server-side, linting, testing, dan production build.

# 3. Architectural Style

## 3.1 Modular Monolith

Arsitektur yang direkomendasikan adalah Modular Monolith. Seluruh domain utama berada dalam satu aplikasi Next.js dan satu repository, tetapi dipisahkan menjadi modul dengan boundary yang jelas. Pendekatan ini lebih sederhana untuk deployment dan development awal, namun tetap menyediakan struktur yang dapat berkembang.

> Client\
> │\
> ▼\
> Next.js Application\
> ├── Presentation\
> ├── Application\
> ├── Domain\
> ├── Infrastructure\
> └── Database Access\
> │\
> ├── PostgreSQL / Neon\
> ├── Stripe\
> └── Realtime Layer

## 3.2 Alasan Pemilihan

-   Mengurangi kompleksitas operasional dibanding microservices.

-   Memudahkan transaction dan consistency pada order/payment.

-   Lebih cepat dikembangkan untuk kebutuhan satu produk restoran.

-   Memudahkan debugging dan deployment.

-   Boundary modul tetap memungkinkan ekstraksi service di masa depan bila kebutuhan scale meningkat.

# 4. High-Level System Architecture

> ┌─────────────────────────┐\
> │ CUSTOMER │\
> │ Mobile / Desktop / PWA │\
> └────────────┬────────────┘\
> │ HTTPS\
> ▼\
> ┌─────────────────────────────────────────────────────────────┐\
> │ NEXT.JS APPLICATION │\
> │ │\
> │ Presentation Layer │\
> │ ├── Public Website │\
> │ ├── Customer Account │\
> │ ├── Staff / Kitchen Board │\
> │ └── Admin Dashboard │\
> │ │\
> │ Application Layer │\
> │ ├── Auth ├── Catalog ├── Cart ├── Order │\
> │ ├── Payment ├── Kitchen ├── Review ├── Admin │\
> │ ├── Reporting ├── Audit └── Settings │\
> │ │\
> │ API / Server Layer │\
> │ ├── Route Handlers │\
> │ ├── Server Actions │\
> │ └── Webhooks │\
> └───────────────┬───────────────────┬─────────────────────────┘\
> │ │\
> ▼ ▼\
> ┌────────────────┐ ┌──────────────────┐\
> │ Drizzle ORM │ │ Stripe │\
> └───────┬────────┘ └──────────────────┘\
> │\
> ▼\
> ┌────────────────────┐\
> │ PostgreSQL / Neon │\
> └────────────────────┘

# 5. Technology Stack

  -----------------------------------------------------------------------------------------------------
  Layer                   Technology                        Purpose
  ----------------------- --------------------------------- -------------------------------------------
  Frontend                Next.js + React                   Public website, customer, staff, admin UI

  Language                TypeScript                        Type safety

  Backend                 Next.js Server-Side API           Business operations and API

  API                     Route Handlers + Server Actions   Mutations, SSE streams, and HTTP endpoints

  Database                PostgreSQL / Neon                 Persistent application data

  ORM                     Drizzle ORM                       Type-safe database access

  Authentication          Auth.js (NextAuth) + Drizzle      Database session adapter with RBAC

  Media Storage           Cloudinary                        Optimized image storage & CDN for menus

  Validation              Server-side schema validation     Validate all user input (Zod)

  Payment                 Stripe                            Online payment (Dynamic currency via Settings)

  Realtime                Server-Sent Events (SSE)          Kitchen notifications and live order status

  PWA                     Progressive Web App               Installable responsive experience

  Version Control         GitHub                            Source control and collaboration
  -----------------------------------------------------------------------------------------------------

# 6. Application Layers

## 6.1 Presentation Layer

Berisi halaman, layout, component, form, state UI, dan pengalaman pengguna untuk public, customer, staff, dan admin.

## 6.2 Application Layer

Berisi use case dan orchestration seperti create order, checkout, update order status, product management, review, reporting, dan audit.

## 6.3 Domain Layer

Berisi business rules inti seperti order status transition, price calculation, review eligibility, role definition, dan payment status.

## 6.4 Infrastructure Layer

Berisi database client, Drizzle, Stripe client/webhook, realtime integration, storage, dan integrasi eksternal.

## 6.5 Database Layer

PostgreSQL sebagai persistent source of truth untuk user, catalog, order, payment, review, audit, dan settings.

# 7. Module Architecture

> modules/\
> ├── auth/\
> ├── catalog/\
> ├── cart/\
> ├── order/\
> ├── payment/\
> ├── kitchen/\
> ├── review/\
> ├── admin/\
> ├── reporting/\
> ├── audit/\
> └── settings/

Setiap modul sebaiknya memiliki boundary yang jelas dan tidak mengakses internal modul lain secara sembarangan.

# 8. Recommended Project Structure

> restaurant-app/\
> ├── app/\
> │ ├── (public)/\
> │ ├── (customer)/\
> │ ├── (staff)/\
> │ ├── (admin)/\
> │ └── api/\
> │ ├── auth/\
> │ ├── products/\
> │ ├── categories/\
> │ ├── orders/\
> │ ├── payments/\
> │ ├── reviews/\
> │ └── webhooks/\
> ├── components/\
> │ ├── ui/\
> │ ├── layout/\
> │ ├── menu/\
> │ ├── cart/\
> │ ├── checkout/\
> │ ├── kitchen/\
> │ └── admin/\
> ├── modules/\
> │ ├── auth/\
> │ ├── catalog/\
> │ ├── cart/\
> │ ├── order/\
> │ ├── payment/\
> │ ├── kitchen/\
> │ ├── review/\
> │ ├── admin/\
> │ ├── reporting/\
> │ ├── audit/\
> │ └── settings/\
> ├── domain/\
> ├── db/\
> │ ├── schema/\
> │ ├── migrations/\
> │ └── seed.ts\
> ├── lib/\
> │ ├── auth/\
> │ ├── stripe/\
> │ ├── realtime/\
> │ ├── validation/\
> │ └── utils/\
> ├── tests/\
> │ ├── unit/\
> │ ├── integration/\
> │ └── e2e/\
> ├── public/\
> ├── middleware.ts\
> └── next.config.ts

# 9. Role-Based Access Control

> User\
> │\
> └── Role\
> ├── CUSTOMER\
> ├── STAFF\
> └── ADMIN\
> \
> CUSTOMER → public, account, checkout, order history/status, review\
> STAFF → kitchen board, notifications, order status\
> ADMIN → products, categories, prices, users, orders, reports, audit, settings

Authorization harus dilakukan di server. Middleware dapat digunakan sebagai lapisan awal proteksi route, tetapi business operation tetap harus melakukan authorization server-side.

# 10. Database Architecture

> User\
> │\
> ├──\< Order\
> │ ├──\< OrderItem \>── Product \>── Category\
> │ │ │\
> │ │ └── ProductOption\
> │ └── Payment\
> │\
> └──\< Review \>── Product\
> \
> User ──\< AuditLog\
> RestaurantSettings

Entitas utama mengikuti PRD: User, Category, Product, ProductOption/Extra, Order, OrderItem, Payment, Review, AuditLog, dan RestaurantSettings.

# 11. Customer Ordering Flow

> Browse Menu\
> ↓\
> Product Detail\
> ↓\
> Customization / Extras\
> ↓\
> Cart\
> ↓\
> Checkout\
> ↓\
> Stripe\
> ↓\
> Stripe Webhook\
> ↓\
> Payment Confirmation\
> ↓\
> Order\
> ↓\
> Realtime Kitchen Notification\
> ↓\
> Order Status Tracking\
> ↓\
> Review Eligibility

# 12. Payment Architecture

Stripe webhook menjadi sumber konfirmasi pembayaran di sisi backend. Halaman success tidak boleh menjadi satu-satunya sumber kebenaran transaksi.

> Customer\
> ↓\
> Checkout\
> ↓\
> Backend creates Stripe Checkout\
> ↓\
> Stripe\
> ↓\
> Webhook\
> ↓\
> Verify Stripe Event\
> ↓\
> Update Payment\
> ↓\
> Update Order\
> ↓\
> Notify Kitchen

# 13. Kitchen / Realtime Architecture (Server-Sent Events)

> Order Created / Status Changed\
> ↓\
> Database Transaction (Drizzle / PostgreSQL)\
> ↓\
> In-Memory / Event Broadcaster (SSE)\
> ↓\
> Next.js Route Handler (`GET /api/realtime/kitchen` & `GET /api/realtime/orders/:id`)\
> ├── Kitchen Board (Staff View)\
> └── Live Order Tracking (Customer View)\
> ↓\
> Staff Acknowledge / Transition Status\
> ↓\
> Database Update & SSE Broadcast

-   Server-Sent Events (SSE) menyediakan komunikasi satu arah server-ke-klien yang ringan, native di HTTP, dan cocok untuk lingkungan serverless/Next.js standar.
-   Database tetap menjadi source of truth mutlak. Realtime SSE digunakan untuk penyampaian status kilat tanpa polling terus-menerus.
-   Pada saat terjadi network reconnect, client secara otomatis memicu query fetch ulang untuk sinkronisasi authoritative state terbaru dari database.

# 14. Validation and Security

-   Server-side validation untuk seluruh input menggunakan Zod schema.

-   Authentication dan session menggunakan Auth.js (NextAuth) dengan Drizzle Adapter (tabel sessions di PostgreSQL).

-   RBAC ketat pada server (Customer, Staff, Admin).

-   Password disimpan menggunakan hashing yang aman (mis. bcrypt / argon2).

-   HTTP-only secure cookies untuk session Auth.js.

-   Stripe webhook signature verification & idempotency.

-   Cloudinary upload menggunakan signed upload presets / server-side signature.

-   Kalkulasi harga dan konversi mata uang dihitung ulang di server berdasarkan preferensi RestaurantSettings.

-   Rate limiting untuk endpoint sensitif (login, checkout, webhook).

-   Audit logging untuk setiap mutasi penting.

-   Database access melalui layer server, bukan dari client langsung.

# 15. Testing Architecture

> tests/\
> ├── unit/\
> │ ├── order-calculator.test.ts\
> │ ├── currency-formatter.test.ts\
> │ ├── order-status.test.ts\
> │ └── review-eligibility.test.ts\
> ├── integration/\
> │ ├── auth.test.ts\
> │ ├── order.test.ts\
> │ ├── payment.test.ts\
> │ └── sse-kitchen.test.ts\
> └── e2e/\
> ├── customer-order.spec.ts\
> ├── kitchen-flow.spec.ts\
> └── admin-flow.spec.ts

Critical E2E flow: register/login → browse → customize → cart → checkout → payment → order → kitchen (SSE notification) → status update → customer tracking (live update) → review.

# 16. Deployment Architecture

> GitHub\
> ↓\
> CI/CD\
> ↓\
> Production Next.js Application\
> ├── PostgreSQL / Neon\
> ├── Cloudinary CDN\
> ├── Stripe API\
> └── SSE Realtime Endpoints\
> \
> Environments:\
> Development → Staging → Production

Environment variables minimal yang dibutuhkan:
- `DATABASE_URL` (PostgreSQL / Neon)
- `AUTH_SECRET` & `NEXTAUTH_URL` (Auth.js)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (Cloudinary Media)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Stripe)
- `NEXT_PUBLIC_APP_URL`

# 17. Observability and Audit

-   AuditLog menyimpan aktor, aksi, entitas, dan waktu perubahan penting.

-   Application error logging untuk server errors dan payment failures.

-   Monitoring terhadap webhook Stripe.

-   Monitoring terhadap database connectivity dan SSE stream connections.

-   Logging tidak boleh menyimpan secret atau data sensitif secara tidak perlu.

# 18. Architecture Decision Records

> docs/\
> └── adr/\
> ├── 001-modular-monolith.md\
> ├── 002-nextjs-fullstack.md\
> ├── 003-postgresql-neon.md\
> ├── 004-drizzle-orm.md\
> ├── 005-stripe-payment.md\
> ├── 006-authjs-drizzle-adapter.md\
> ├── 007-sse-kitchen-realtime.md\
> ├── 008-cloudinary-media-storage.md\
> └── 009-dynamic-currency-settings.md

# 19. Non-Functional Requirements Mapping

  ---------------------------------------------------------------------------------------
  PRD Requirement                     Architectural Response
  ----------------------------------- ---------------------------------------------------
  Real backend/database               Next.js server + PostgreSQL/Neon + Drizzle

  Server-side validation              Validation layer (Zod) pada server boundary

  RBAC                                Auth.js Drizzle Adapter + server-side authorization

  TypeScript clean                    TypeScript strict/type checking

  ESLint clean                        CI quality gate

  Production build                    CI/CD build validation

  Extensible codebase                 Modular monolith + domain/application boundaries

  Media Storage                       Cloudinary CDN & Image Optimization

  Responsive + PWA                    Responsive Next.js UI + PWA support

  Stripe E2E                          Stripe Checkout + verified webhook (Dynamic Currency)

  Realtime kitchen                    Server-Sent Events (SSE) + DB source of truth
  ---------------------------------------------------------------------------------------

# 20. Architecture Summary

Arsitektur final yang direkomendasikan adalah Modular Monolith berbasis Next.js + React + TypeScript, menggunakan Next.js Server-Side API & Server Actions, PostgreSQL/Neon, Drizzle ORM, authentication menggunakan Auth.js (NextAuth) dengan Drizzle Database Adapter, Cloudinary untuk media gambar, Stripe untuk pembayaran online multi-currency, Server-Sent Events (SSE) untuk realtime kitchen board & customer tracking, serta PWA untuk pengalaman mobile.

> CLIENT / PWA\
> │\
> ▼\
> NEXT.JS + REACT\
> │\
> ┌───────────┴───────────┐\
> ▼ ▼\
> PRESENTATION SERVER / API (SSE & REST)\
> │\
> APPLICATION\
> │\
> DOMAIN\
> │\
> ┌───────────┼──────────┬───────────┐\
> ▼ ▼ ▼ ▼\
> DRIZZLE STRIPE CLOUDINARY AUTH.JS\
> │\
> ▼\
> POSTGRESQL (NEON)\
> │\
> ▼\
> REAL DATA

# 21. Next Technical Documents

-   03-DATABASE-SCHEMA.md --- detail tabel, column, type, index, constraint.

-   04-ERD.md --- hubungan seluruh entity.

-   05-API-SPECIFICATION.md --- endpoint, request, response, error, authorization.

-   06-AUTHENTICATION.md --- session, RBAC, middleware, authorization matrix.

-   07-UI-UX-SPECIFICATION.md --- page architecture dan component requirements.

-   08-INTEGRATION.md --- Stripe dan realtime integration.

-   09-DEPLOYMENT.md --- environment, CI/CD, hosting, database migration.

-   10-SECURITY.md --- security controls dan threat considerations.

-   11-TESTING.md --- unit, integration, E2E, dan acceptance test strategy.
