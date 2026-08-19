**API SPECIFICATION**

Restaurant Ordering Application --- REST API / Next.js Route Handlers\
Version 1.0 --- 18 August 2026

# 1. API Principles

-   Base path: /api.

-   JSON request/response untuk endpoint application.

-   Authentication/session diverifikasi server-side.

-   RBAC diterapkan pada endpoint staff/admin.

-   Validation dilakukan sebelum business operation.

-   API tidak boleh mempercayai total harga dari client; server menghitung ulang.

-   Stripe webhook diverifikasi dengan signature.

-   Error response menggunakan struktur konsisten.

# 2. Response Format

> Success: { \"data\": {\...}, \"meta\": {\...} }\
> Error: { \"error\": { \"code\": \"VALIDATION_ERROR\", \"message\": \"\...\", \"details\": \[\...\] } }

# 3. Authentication (Auth.js / NextAuth)

  -------------------------------------------------------------------------------------------------------
  Method            Endpoint                     Auth              Purpose
  ----------------- ---------------------------- ----------------- --------------------------------------
  POST              /api/auth/register           Public            Create customer account with password
  
  ALL               /api/auth/[...nextauth]      Public/Session    Auth.js core routes (login, session, csrf)

  POST              /api/auth/signout            Authenticated     Destroy current session

  GET               /api/auth/session            Authenticated     Get current session and user role
  -------------------------------------------------------------------------------------------------------

# 4. Catalog API

  -------------------------------------------------------------------------------------------------------
  Method            Endpoint                              Auth              Purpose
  ----------------- ------------------------------------- ----------------- -----------------------------
  GET               /api/categories                       Public            List active categories

  POST              /api/categories                       Admin             Create category

  PATCH             /api/categories/:id                   Admin             Update category

  DELETE            /api/categories/:id                   Admin             Deactivate/delete category

  GET               /api/products                         Public            List/search/filter products

  GET               /api/products/:id                     Public            Get product detail

  POST              /api/products                         Admin             Create product

  PATCH             /api/products/:id                     Admin             Update product

  DELETE            /api/products/:id                     Admin             Deactivate product

  POST              /api/products/:id/options             Admin             Create product option

  PATCH             /api/products/:id/options/:optionId   Admin             Update product option

  DELETE            /api/products/:id/options/:optionId   Admin             Deactivate option
  -------------------------------------------------------------------------------------------------------

# 5. Order API

  -------------------------------------------------------------------------------------------------------------------------
  Method            Endpoint                      Auth                   Purpose
  ----------------- ----------------------------- ---------------------- --------------------------------------------------
  POST              /api/orders                   Customer / Guest       Create order (Authenticated or Guest Fast Checkout)

  GET               /api/orders                   Customer/Admin         List own orders or all orders for admin

  GET               /api/orders/:id               Customer/Staff/Admin/Guest Get order detail (with guest token for guests)

  PATCH             /api/orders/:id/status        Staff/Admin            Transition order status

  POST              /api/orders/:id/acknowledge   Staff/Admin            Acknowledge kitchen order

  GET               /api/orders/:id/status        Customer / Guest       Get current order tracking status
  -------------------------------------------------------------------------------------------------------------------------

# 6. Realtime API (Server-Sent Events)

  -------------------------------------------------------------------------------------------------------------------------
  Method            Endpoint                      Auth                   Purpose
  ----------------- ----------------------------- ---------------------- --------------------------------------------------
  GET               /api/realtime/kitchen         Staff/Admin            SSE stream for live kitchen orders & updates

  GET               /api/realtime/orders/:id      Customer/Staff/Guest   SSE stream for live customer/guest order tracking
  -------------------------------------------------------------------------------------------------------------------------

# 7. Payment API (Stripe Multi-Currency)

  ------------------------------------------------------------------------------------------------
  Method            Endpoint                 Auth                 Purpose
  ----------------- ------------------------ -------------------- -----------------------------------
  POST              /api/payments/checkout   Customer / Guest     Create Stripe Checkout session (supports Guest)

  POST              /api/admin/orders/:id/mark-paid Admin/Staff   Mark order as paid at cashier (Cash / EDC)

  GET               /api/payments/:orderId   Customer/Admin/Guest Get payment status

  POST              /api/webhooks/stripe     Stripe               Receive and verify Stripe webhook
  ------------------------------------------------------------------------------------------------

# 8. Review API (Includes Photo Uploads)

  -----------------------------------------------------------------------------------------------------------------
  Method            Endpoint                           Auth              Purpose
  ----------------- ---------------------------------- ----------------- ------------------------------------------
  POST              /api/reviews                       Customer          Create eligible product review (with photo URLs)

  GET               /api/products/:productId/reviews   Public            List product reviews with customer photo gallery

  PATCH             /api/reviews/:id                   Customer          Update own review if policy allows

  DELETE            /api/reviews/:id                   Customer/Admin    Remove review according to authorization
  -----------------------------------------------------------------------------------------------------------------

# 9. Admin, Print & Media API (Cloudinary & ESC/POS)

  ---------------------------------------------------------------------------------------------------------
  Method            Endpoint                     Auth              Purpose
  ----------------- ---------------------------- ----------------- ---------------------------------------------
  GET               /api/orders/:id/print-kot    Staff / Admin     Generate 58mm/80mm ESC/POS printable KOT receipt

  POST              /api/admin/media/sign        Admin / Customer  Generate Cloudinary signed upload parameters

  GET               /api/admin/users             Admin             List users

  PATCH             /api/admin/users/:id         Admin             Update user status/role according to policy

  GET               /api/admin/orders            Admin             List and filter all orders

  GET               /api/admin/reports           Admin             Operational reporting

  GET               /api/admin/audit-logs        Admin             View audit trail

  GET               /api/admin/settings          Admin             Get restaurant settings (currency, hours, etc.)

  PATCH             /api/admin/settings          Admin             Update restaurant settings & currency
  ---------------------------------------------------------------------------------------------------------

# 10. Core Request Examples

## 10.1 Create Order (Supports Authenticated & Guest Checkout)

> POST /api/orders\
> {\
> \"orderType\": \"dine_in\", // \"dine_in\" | \"takeaway\" | \"delivery\"\
> \"tableNumber\": \"08\",    // Opsional untuk dine-in\
> \"guestInfo\": {            // Diisi jika memesan sebagai Guest (tanpa login)\
> \"name\": \"Budi Santoso\",\
> \"email\": \"budi@example.com\",\
> \"phone\": \"+6281234567890\"\
> },\
> \"items\": \[\
> {\
> \"productId\": \"uuid\",\
> \"quantity\": 2,\
> \"options\": \[{ \"productOptionId\": \"uuid\", \"quantity\": 1 }\],\
> \"note\": \"Less spicy\"\
> }\
> \],\
> \"customerNote\": \"Please serve drinks first\"\
> }

Server memverifikasi: jika pengguna login via Auth.js, tautkan `customer_id`. Jika Guest, isi `guest_name`, `guest_email`, `guest_phone`, dan generate `guest_tracking_token`. Server menghitung ulang seluruh harga dari database, memeriksa ketersediaan, lalu membuat order secara transaksional.

## 9.2 Update Order Status

> PATCH /api/orders/:id/status\
> { \"status\": \"preparing\" }

Server memvalidasi bahwa transisi status diperbolehkan berdasarkan state machine.

## 9.3 Create Stripe Checkout

> POST /api/payments/checkout\
> { \"orderId\": \"uuid\" }\
> \
> Response\
> { \"data\": { \"checkoutUrl\": \"https://\...\" } }

# 10. HTTP Status Codes

  -----------------------------------------------------------------------------------
  Status                              Usage
  ----------------------------------- -----------------------------------------------
  200                                 Successful read/update

  201                                 Resource created

  204                                 Successful deletion/deactivation without body

  400                                 Invalid request

  401                                 Unauthenticated

  403                                 Authenticated but not authorized

  404                                 Resource not found

  409                                 Conflict/state conflict

  422                                 Business/validation error

  429                                 Rate limit exceeded

  500                                 Unexpected server error
  -----------------------------------------------------------------------------------

# 11. Authorization Matrix

  --------------------------------------------------------------------------------------------------
  Resource              Customer       Staff          Admin          Public
  --------------------- -------------- -------------- -------------- -------------------------------
  Catalog               Read           Read           CRUD           Read

  Cart                  Own            \-             \-             \-

  Orders                Own            Kitchen        All            \-

  Payments              Own status     \-             All            \-

  Reviews               Own eligible   \-             Moderate       Read

  Users                 Own profile    \-             CRUD           \-

  Reports               \-             Operational    Read           \-

  Audit Logs            \-             \-             Read           \-

  Restaurant Settings   \-             \-             CRUD           Read selected public settings
  --------------------------------------------------------------------------------------------------

# 12. API Security Rules

-   Never accept client-supplied authoritative price/total.

-   Never expose password_hash.

-   Verify current user and role on every protected operation.

-   Verify order ownership for customer endpoints.

-   Verify Stripe webhook signature before processing.

-   Use idempotency for payment webhook processing and other retryable operations.

-   Write audit log for important admin/staff mutations.

-   Return generic authentication errors where exposing account existence would create unnecessary information leakage.

# 13. API Implementation Mapping

> Route Handler / Server Action\
> ↓\
> Schema Validation\
> ↓\
> Authorization\
> ↓\
> Application Service / Use Case\
> ↓\
> Domain Rules\
> ↓\
> Repository / Drizzle\
> ↓\
> PostgreSQL

API Specification ini sengaja tidak menetapkan detail yang belum ditentukan PRD, seperti delivery address, table reservation, coupon, tax provider, atau loyalty system. Fitur tersebut harus menjadi perubahan requirement sebelum dimasukkan ke schema/API.
