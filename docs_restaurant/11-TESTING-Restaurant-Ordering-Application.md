**11 --- TESTING**

Restaurant Ordering Application --- Testing Strategy\
Version 1.0 --- 18 August 2026

# 1. Testing Objectives

Testing harus memverifikasi functional requirements dan acceptance criteria PRD, termasuk real data, RBAC, Stripe end-to-end, realtime kitchen notification, responsive UI/PWA, TypeScript, ESLint, dan production build. fileciteturn0file0L176-L185

# 2. Test Pyramid

> ┌─────────────┐\
> │ E2E Tests │\
> └──────┬──────┘\
> ┌─────────┴─────────┐\
> │ Integration Tests │\
> └─────────┬─────────┘\
> ┌───────────┴───────────┐\
> │ Unit Tests │\
> └───────────────────────┘

# 3. Unit Testing

-   Order total calculator & dynamic currency conversion (zero-decimal vs 2-decimal).

-   Currency formatting utility (Rp, $, €, etc.).

-   Order status state machine transition rules.

-   Review eligibility validator.

-   Role/permission helpers (RBAC).

-   Zod input validation schemas.

-   Utility functions (slugify, date/time formatting).

# 4. Integration Testing

-   Auth.js registration, login, and Drizzle database session lifecycle.

-   Order creation with database transaction & stock/availability checks.

-   Stripe Checkout session generation with configured restaurant currency.

-   Stripe webhook processing, signature verification, and idempotency.

-   Realtime SSE stream broadcasting on order creation and status change.

-   Cloudinary upload parameter signing and asset linkage.

-   Review eligibility against completed order.

-   Admin mutations and audit log creation.

# 5. End-to-End Scenarios

  --------------------------------------------------------------------------------------------------------------
  ID                      Scenario                                       Expected Result
  ----------------------- ---------------------------------------------- ---------------------------------------
  E2E-01                  Customer registers and logs in                 Authenticated session created

  E2E-02                  Customer browses/searches menu                 Correct products returned

  E2E-03                  Customer customizes product and adds to cart   Correct options and quantity retained

  E2E-04                  Customer completes checkout                    Stripe checkout created

  E2E-05                  Stripe webhook confirms payment                Payment/order updated

  E2E-06                  New order reaches kitchen                      Kitchen board updates in realtime

  E2E-07                  Staff updates order status                     Customer tracking reflects status

  E2E-08                  Eligible customer writes review                Review accepted

  E2E-09                  Ineligible customer writes review              Review rejected

  E2E-10                  Customer attempts another user\'s order        403/Not Found according to policy

  E2E-11                  Staff opens admin route                        Access denied

  E2E-12                  Admin changes product                          Product updated and audit logged
  --------------------------------------------------------------------------------------------------------------

# 6. Quality Gates

-   TypeScript typecheck: PASS.

-   ESLint: PASS.

-   Unit tests: PASS.

-   Integration tests: PASS.

-   Critical E2E: PASS.

-   Production build: PASS.

-   No critical security findings before release.

# 7. Test Data Strategy

-   Use isolated test database/environment.

-   Use deterministic seed data for automated tests.

-   Never use real customer/payment data in automated test suites.

-   Stripe test mode for payment tests.

# 8. Regression Strategy

-   Every PR runs fast unit/integration checks.

-   Main branch runs complete required suite.

-   Before production deploy, run critical E2E and smoke tests.

-   Changes to schema trigger database/integration regression tests.

# 9. Bug Severity

  ---------------------------------------------------------------------------------------------
  Severity                            Definition
  ----------------------------------- ---------------------------------------------------------
  P0                                  Production blocker, payment/data loss/security critical

  P1                                  Critical business flow broken

  P2                                  Important feature degraded with workaround

  P3                                  Minor UI/content/non-critical issue
  ---------------------------------------------------------------------------------------------
