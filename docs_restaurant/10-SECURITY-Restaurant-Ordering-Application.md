**10 --- SECURITY**

Restaurant Ordering Application --- Security Specification\
Version 1.0 --- 18 August 2026

# 1. Security Scope

Security architecture melindungi akun, order, payment, admin operations, database, dan integration endpoints. PRD mewajibkan server-side validation, RBAC, dan audit logging. fileciteturn0file0L114-L123

# 2. Security Principles

-   Least privilege.

-   Server is authoritative.

-   Validate untrusted input.

-   Never trust client price/status/role.

-   Secure secrets.

-   Audit sensitive mutations.

-   Fail safely.

-   Minimize sensitive data exposure.

# 3. Threat Areas

  ---------------------------------------------------------------------------------------------------------
  Area                    Threat                         Control
  ----------------------- ------------------------------ --------------------------------------------------
  Authentication          Credential theft/brute force   Auth.js hashing (bcrypt), DB sessions, rate limit

  Authorization           Privilege escalation           Server-side RBAC and ownership checks

  Orders                  Price manipulation             Server authoritative calculation based on Settings

  Payments                Fake payment confirmation      Stripe webhook signature verification & idempotency

  Media Upload            Arbitrary/malicious file       Cloudinary server-signed upload signature & types

  Webhooks                Replay/duplicate events        Idempotency and provider transaction tracking

  Admin                   Unauthorized mutation          Admin authorization + immutable audit log

  Input                   Injection/invalid payload      Zod schema validation + parameterized Drizzle ORM

  Secrets                 Credential exposure            Environment secrets, no commit, safe runtime

  Realtime (SSE)          Unauthorized stream access     Staff/Customer session verification per stream

  Logs                    Sensitive data leakage         Structured safe logging without secrets/passwords
  ---------------------------------------------------------------------------------------------------------

# 4. Authentication Security

-   Use strong password hashing (bcrypt / argon2).
-   Auth.js database sessions stored in PostgreSQL via Drizzle Adapter with secure HTTP-only cookies.
-   Session expiry and server-side revocation on logout.
-   Rate-limit login and registration endpoints.
-   Do not return password_hash in API responses.
-   Protect account-sensitive endpoints via server middleware & server components.

# 5. Authorization Security

> Request\
> ↓\
> Session validation\
> ↓\
> Role check\
> ↓\
> Resource ownership check\
> ↓\
> Business rule validation\
> ↓\
> Mutation

# 6. Payment Security

-   Stripe secret key server-side only.

-   Webhook signature verification.

-   Idempotent webhook handling.

-   Order total calculated server-side.

-   Never store raw card data.

-   Do not mark order paid from frontend redirect alone.

# 7. Audit Logging

AuditLog minimal fields: actor_user_id, action, entity_type, entity_id, metadata, created_at. Audit logs harus immutable dari sisi normal application flow dan hanya dapat diakses oleh admin.

# 8. Data Protection

-   HTTPS in production.

-   Encrypt sensitive data at rest via provider capabilities where applicable.

-   Restrict database credentials.

-   Do not log passwords, tokens, Stripe secrets, or unnecessary payment details.

-   Define retention policy for operational logs.

# 9. Security Headers / Web Controls

-   Use secure HTTP headers appropriate to the deployed Next.js application.

-   Configure CSP carefully if enabled.

-   Prevent clickjacking where appropriate.

-   Use secure cookie flags in production.

-   Limit CORS to required origins if cross-origin access is introduced.

# 10. Security Acceptance Criteria

-   Unauthenticated user cannot access protected operations.

-   Customer cannot access another customer\'s order.

-   Staff cannot perform admin-only operations.

-   Client cannot alter authoritative price.

-   Invalid Stripe webhook is rejected.

-   Important admin mutations generate audit records.

-   Secrets are absent from source control.
