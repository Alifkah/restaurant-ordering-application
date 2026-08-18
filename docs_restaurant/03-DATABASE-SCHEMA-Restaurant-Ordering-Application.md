**DATABASE SCHEMA**

Restaurant Ordering Application --- PostgreSQL / Neon + Drizzle ORM\
Version 1.0 --- 18 August 2026

# 1. Basis and Scope

Schema ini diturunkan dari PRD dan System Architecture. PRD menetapkan entitas utama User, Category, Product, ProductOption/Extra, Order, OrderItem, Payment, Review, AuditLog, dan RestaurantSettings. Struktur berikut memperinci entitas tersebut agar dapat diimplementasikan dengan PostgreSQL dan Drizzle ORM. fileciteturn0file0L138-L150

# 2. Design Principles

-   UUID sebagai primary key untuk entity utama.

-   Harga uang disimpan sebagai integer dalam satuan currency terkecil untuk menghindari floating-point error.

-   Timestamp disimpan dengan timezone.

-   Order menyimpan snapshot nama/harga item agar riwayat order tidak berubah ketika katalog berubah.

-   Status order menggunakan controlled values dan hanya dapat berpindah melalui business rules.

-   Soft-disable digunakan untuk product/category/user yang perlu dipertahankan historinya.

-   Foreign key dan index diterapkan pada relasi yang sering dicari.

# 3. Core Tables

## users (Auth.js Compatible)

  ---------------------------------------------------------------------------------
  Column                  Type                              Constraint
  ----------------------- --------------------------------- -----------------------
  id                      uuid                              PK (Default: gen_random_uuid())

  name                    varchar(150)                      NOT NULL

  email                   varchar(255)                      UNIQUE NOT NULL

  email_verified          timestamptz                       NULLABLE

  image                   text                              NULLABLE

  password_hash           text                              NULLABLE (untuk credentials login)

  role                    enum(customer,staff,admin)        DEFAULT 'customer' NOT NULL

  status                  enum(active,inactive,suspended)   DEFAULT 'active' NOT NULL

  created_at              timestamptz                       DEFAULT now() NOT NULL

  updated_at              timestamptz                       DEFAULT now() NOT NULL
  ---------------------------------------------------------------------------------

## accounts (Auth.js Adapter)

  ---------------------------------------------------------------------------------
  Column                  Type                              Constraint
  ----------------------- --------------------------------- -----------------------
  id                      uuid                              PK

  user_id                 uuid                              FK → users.id (CASCADE)

  type                    varchar(255)                      NOT NULL

  provider                varchar(255)                      NOT NULL

  provider_account_id     varchar(255)                      NOT NULL

  refresh_token           text                              NULLABLE

  access_token            text                              NULLABLE

  expires_at              integer                           NULLABLE

  token_type              varchar(255)                      NULLABLE

  scope                   varchar(255)                      NULLABLE

  id_token                text                              NULLABLE

  session_state           varchar(255)                      NULLABLE
  ---------------------------------------------------------------------------------

## sessions (Auth.js Database Session)

  ---------------------------------------------------------------------------------
  Column                  Type                              Constraint
  ----------------------- --------------------------------- -----------------------
  session_token           varchar(255)                      PK / UNIQUE NOT NULL

  user_id                 uuid                              FK → users.id (CASCADE)

  expires                 timestamptz                       NOT NULL
  ---------------------------------------------------------------------------------

## verification_tokens (Auth.js Token Verification)

  ---------------------------------------------------------------------------------
  Column                  Type                              Constraint
  ----------------------- --------------------------------- -----------------------
  identifier              varchar(255)                      NOT NULL

  token                   varchar(255)                      NOT NULL

  expires                 timestamptz                       NOT NULL
  ---------------------------------------------------------------------------------
  *Composite Primary Key: (identifier, token)*

## categories

  -----------------------------------------------------------------------
  Column                  Type                    Constraint
  ----------------------- ----------------------- -----------------------
  id                      uuid                    PK

  name                    varchar(120)            NOT NULL

  slug                    varchar(140)            UNIQUE NOT NULL

  description             text                    NULLABLE

  sort_order              integer                 DEFAULT 0

  is_active               boolean                 DEFAULT true

  created_at              timestamptz             NOT NULL

  updated_at              timestamptz             NOT NULL
  -----------------------------------------------------------------------

## products

  -----------------------------------------------------------------------
  Column                  Type                    Constraint
  ----------------------- ----------------------- -----------------------
  id                      uuid                    PK

  category_id             uuid                    FK → categories.id

  name                    varchar(180)            NOT NULL

  slug                    varchar(200)            UNIQUE NOT NULL

  description             text                    NULLABLE

  price_minor             bigint                  NOT NULL

  currency                char(3)                 DEFAULT 'IDR'

  image_url               text                    NULLABLE

  image_public_id         varchar(255)            NULLABLE (Cloudinary Public ID)

  is_available            boolean                 DEFAULT true

  sort_order              integer                 DEFAULT 0

  created_at              timestamptz             NOT NULL

  updated_at              timestamptz             NOT NULL
  -----------------------------------------------------------------------

## product_options

  -----------------------------------------------------------------------
  Column                  Type                    Constraint
  ----------------------- ----------------------- -----------------------
  id                      uuid                    PK

  product_id              uuid                    FK → products.id

  name                    varchar(150)            NOT NULL

  description             text                    NULLABLE

  price_delta_minor       bigint                  DEFAULT 0

  is_available            boolean                 DEFAULT true

  sort_order              integer                 DEFAULT 0

  created_at              timestamptz             NOT NULL
  -----------------------------------------------------------------------

## orders

  -------------------------------------------------------------------------------------------------------------
  Column                  Type                                                          Constraint
  ----------------------- ------------------------------------------------------------- -----------------------
  id                      uuid                                                          PK

  order_number            varchar(30)                                                   UNIQUE NOT NULL

  customer_id             uuid                                                          FK → users.id

  status                  enum(pending,confirmed,preparing,ready,completed,cancelled)   NOT NULL

  subtotal_minor          bigint                                                        NOT NULL

  discount_minor          bigint                                                        DEFAULT 0

  tax_minor               bigint                                                        DEFAULT 0

  total_minor             bigint                                                        NOT NULL

  currency                char(3)                                                       DEFAULT IDR

  customer_note           text                                                          NULLABLE

  created_at              timestamptz                                                   NOT NULL

  updated_at              timestamptz                                                   NOT NULL
  -------------------------------------------------------------------------------------------------------------

## order_items

  -----------------------------------------------------------------------
  Column                  Type                    Constraint
  ----------------------- ----------------------- -----------------------
  id                      uuid                    PK

  order_id                uuid                    FK → orders.id

  product_id              uuid                    FK → products.id

  product_name_snapshot   varchar(180)            NOT NULL

  unit_price_minor        bigint                  NOT NULL

  quantity                integer                 NOT NULL

  line_total_minor        bigint                  NOT NULL

  note                    text                    NULLABLE

  created_at              timestamptz             NOT NULL
  -----------------------------------------------------------------------

## order_item_options

  -------------------------------------------------------------------------
  Column                  Type                    Constraint
  ----------------------- ----------------------- -------------------------
  id                      uuid                    PK

  order_item_id           uuid                    FK → order_items.id

  product_option_id       uuid                    FK → product_options.id

  option_name_snapshot    varchar(150)            NOT NULL

  price_delta_minor       bigint                  NOT NULL

  quantity                integer                 DEFAULT 1
  -------------------------------------------------------------------------

## payments

  ------------------------------------------------------------------------------------
  Column                  Type                                 Constraint
  ----------------------- ------------------------------------ -----------------------
  id                      uuid                                 PK

  order_id                uuid                                 FK → orders.id

  provider                varchar(30)                          DEFAULT stripe

  provider_payment_id     varchar(255)                         NULLABLE

  checkout_session_id     varchar(255)                         UNIQUE NULLABLE

  status                  enum(pending,paid,failed,refunded)   NOT NULL

  amount_minor            bigint                               NOT NULL

  currency                char(3)                              NOT NULL

  paid_at                 timestamptz                          NULLABLE

  created_at              timestamptz                          NOT NULL

  updated_at              timestamptz                          NOT NULL
  ------------------------------------------------------------------------------------

## reviews

  -----------------------------------------------------------------------
  Column                  Type                    Constraint
  ----------------------- ----------------------- -----------------------
  id                      uuid                    PK

  customer_id             uuid                    FK → users.id

  product_id              uuid                    FK → products.id

  order_id                uuid                    FK → orders.id

  rating                  smallint                1--5

  comment                 text                    NULLABLE

  created_at              timestamptz             NOT NULL

  updated_at              timestamptz             NOT NULL
  -----------------------------------------------------------------------

## audit_logs

  -----------------------------------------------------------------------
  Column                  Type                    Constraint
  ----------------------- ----------------------- -----------------------
  id                      uuid                    PK

  actor_user_id           uuid                    FK → users.id

  action                  varchar(80)             NOT NULL

  entity_type             varchar(80)             NOT NULL

  entity_id               uuid                    NULLABLE

  metadata                jsonb                   NULLABLE

  created_at              timestamptz             NOT NULL
  -----------------------------------------------------------------------

## restaurant_settings

  -----------------------------------------------------------------------
  Column                  Type                    Constraint
  ----------------------- ----------------------- -----------------------
  id                      uuid                    PK

  restaurant_name         varchar(180)            NOT NULL

  location                text                    NULLABLE

  phone                   varchar(40)             NULLABLE

  email                   varchar(255)            NULLABLE

  currency                char(3)                 DEFAULT 'IDR' NOT NULL

  currency_symbol         varchar(10)             DEFAULT 'Rp' NOT NULL

  currency_decimals       smallint                DEFAULT 0 NOT NULL

  timezone                varchar(80)             DEFAULT 'Asia/Makassar'

  opening_hours           jsonb                   NULLABLE

  is_accepting_orders     boolean                 DEFAULT true

  updated_at              timestamptz             NOT NULL
  -----------------------------------------------------------------------

# 4. Key Constraints and Indexes

-   users.email UNIQUE.

-   categories.slug UNIQUE; products.slug UNIQUE.

-   orders.order_number UNIQUE.

-   payments.checkout_session_id UNIQUE bila tersedia.

-   Index orders(customer_id, created_at DESC) untuk riwayat customer.

-   Index orders(status, created_at) untuk kitchen/admin queue.

-   Index order_items(order_id).

-   Index products(category_id, is_available).

-   Index reviews(product_id, created_at DESC).

-   Index audit_logs(entity_type, entity_id, created_at DESC).

-   Review hanya boleh dibuat oleh customer yang memiliki order completed yang mengandung product tersebut; aturan ini ditegakkan pada application/domain layer.

# 5. Order Status State Machine

> PENDING → CONFIRMED → PREPARING → READY → COMPLETED\
> PENDING → CANCELLED\
> CONFIRMED → CANCELLED

Transisi status tidak boleh dilakukan dengan update database langsung dari client; gunakan Order Service.

# 6. Drizzle Implementation Notes

-   Gunakan pgTable untuk setiap table.

-   Gunakan pgEnum untuk role/status yang stabil.

-   Gunakan relations() untuk relasi Drizzle.

-   Gunakan migrations sebagai source of truth perubahan schema.

-   Seed hanya untuk development/staging, bukan data demo pada production.
