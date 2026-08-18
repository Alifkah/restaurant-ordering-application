**09 --- DEPLOYMENT**

Restaurant Ordering Application --- Deployment & Environment Specification\
Version 1.0 --- 18 August 2026

# 1. Deployment Goals

-   Repeatable deployment.

-   Separate development/staging/production configuration.

-   Safe database migrations.

-   Secrets never committed to Git.

-   Production build must pass before release.

# 2. Environment Architecture

> Developer\
> ↓\
> GitHub\
> ↓\
> CI checks\
> ↓\
> Staging\
> ↓\
> Acceptance / smoke test\
> ↓\
> Production

# 3. Runtime Components

> Production\
> ├── Next.js Application\
> ├── PostgreSQL / Neon\
> ├── Stripe\
> └── Realtime Layer

PRD menetapkan PostgreSQL/Neon, Next.js, Stripe, GitHub, dan production hosting sebagai komponen utama. Provider hosting final mengikuti akun milik klien.

# 4. CI/CD Quality Gates

-   Install dependencies reproducibly.

-   TypeScript typecheck passes.

-   ESLint passes.

-   Unit/integration tests pass.

-   Production build succeeds.

-   Database migration status is verified.

-   Deployment only proceeds after required checks.

# 5. Database Migration Strategy

> Local migration\
> ↓\
> Review migration\
> ↓\
> Staging migration\
> ↓\
> Smoke test\
> ↓\
> Production migration\
> ↓\
> Deploy application

Migration harus backward-compatible bila memungkinkan. Hindari perubahan schema yang membuat aplikasi production lama langsung gagal.

# 6. Environment Configuration

  ------------------------------------------------------------------------------------
  Variable                             Purpose                           Secret
  ------------------------------------ --------------------------------- -------------
  DATABASE_URL                         PostgreSQL (Neon) Connection      Yes

  AUTH_SECRET                          Auth.js Session Secret            Yes

  NEXTAUTH_URL                         Auth.js Canonical Origin          No

  CLOUDINARY_CLOUD_NAME                Cloudinary Cloud Account          No

  CLOUDINARY_API_KEY                   Cloudinary API Key                No

  CLOUDINARY_API_SECRET                Cloudinary Secret Key             Yes

  STRIPE_SECRET_KEY                    Stripe Server API Secret          Yes

  STRIPE_WEBHOOK_SECRET                Stripe Webhook Signature Secret   Yes

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   Stripe Client Key                 No/Publishable

  NEXT_PUBLIC_APP_URL                  Canonical App Base URL            No
  ------------------------------------------------------------------------------------

# 7. Release Strategy

-   Use main/production branch policy yang jelas.

-   Tag stable releases.

-   Run migration before application code that depends on new schema where necessary.

-   Perform smoke test after deployment.

-   Keep rollback plan for application and database changes.

# 8. Backup and Recovery

-   Gunakan backup/point-in-time recovery yang disediakan oleh database provider bila tersedia.

-   Document restore procedure.

-   Test recovery periodically.

-   Do not rely on application logs as database backup.

# 9. Production Smoke Tests

-   Homepage loads.

-   Menu and product detail load.

-   Customer login works.

-   Create test checkout in appropriate Stripe environment.

-   Order appears in kitchen.

-   Kitchen status update reaches customer.

-   Admin can manage a product.

-   No critical server error after deployment.

# 10. Deployment Checklist

-   Environment variables configured.

-   Database migration applied.

-   Stripe webhook endpoint configured.

-   Realtime configuration verified.

-   PWA assets/manifest available.

-   HTTPS active.

-   Logs/monitoring available.

-   Smoke tests passed.
