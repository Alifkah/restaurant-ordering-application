**ENTITY RELATIONSHIP DIAGRAM (ERD)**

Restaurant Ordering Application --- PostgreSQL\
Version 1.0 --- 18 August 2026

# 1. ERD Overview

ERD berikut memetakan entitas utama yang ditetapkan dalam PRD dan relasi yang dibutuhkan untuk customer ordering, payment, kitchen workflow, review, dan administration.

> USERS \|\|\--o{ ACCOUNTS : links\
> USERS \|\|\--o{ SESSIONS : authenticates\
> USERS \|\|\--o{ ORDERS : places\
> USERS \|\|\--o{ REVIEWS : writes\
> USERS \|\|\--o{ AUDIT_LOGS : creates\
> \
> CATEGORIES \|\|\--o{ PRODUCTS : contains\
> PRODUCTS \|\|\--o{ PRODUCT_OPTIONS : has\
> PRODUCTS \|\|\--o{ ORDER_ITEMS : ordered_as\
> PRODUCTS \|\|\--o{ REVIEWS : receives\
> \
> ORDERS \|\|\--\|{ ORDER_ITEMS : contains\
> ORDER_ITEMS \|\|\--o{ ORDER_ITEM_OPTIONS : customizes\
> PRODUCT_OPTIONS \|\|\--o{ ORDER_ITEM_OPTIONS : selected_in\
> ORDERS \|\|\--o\| PAYMENTS : has\
> ORDERS \|\|\--o{ REVIEWS : supports_eligibility\
> \
> RESTAURANT_SETTINGS : global_configuration (currency, timezone, hours)

# 2. Cardinality

  --------------------------------------------------------------------------------------------------------
  Relationship                   Cardinality             Meaning
  ------------------------------ ----------------------- -------------------------------------------------
  User → Orders                  0..1 : N                Satu customer terdaftar dapat memiliki banyak order; order guest tidak memiliki User.

  Category → Products            1 : N                   Satu kategori memiliki banyak produk.

  Product → ProductOptions       1 : N                   Produk dapat memiliki beberapa varian/extra.

  Order → OrderItems             1 : N                   Satu order memiliki satu atau lebih item.

  OrderItem → OrderItemOptions   1 : N                   Satu item dapat memiliki beberapa pilihan.

  Order → Payment                1 : 0..1                Order dapat memiliki satu payment record utama.

  User → Reviews                 1 : N                   Customer dapat menulis review.

  Product → Reviews              1 : N                   Produk dapat menerima banyak review.

  User → AuditLogs               1 : N                   Aktor dapat menghasilkan banyak audit event.
  --------------------------------------------------------------------------------------------------------

# 3. Logical ERD Detail

> ┌──────────────┐ ┌──────────────┐ ┌──────────────┐\
> │ USERS │ │ ORDERS │ │ PAYMENTS │\
> ├──────────────┤ ├──────────────┤ ├──────────────┤\
> │ PK id │1────N │ PK id │1────0..1│ PK id │\
> │ email │ │ customer_id │ │ order_id │\
> │ role │ │ status │ │ stripe_id │\
> │ status │ │ totals │ │ status │\
> └──────┬───────┘ └──────┬───────┘ └──────────────┘\
> │ │\
> │ │1\
> │ ▼\
> │ ┌──────────────┐\
> │ │ ORDER_ITEMS │\
> │ ├──────────────┤\
> │ │ PK id │\
> │ │ order_id │\
> │ │ product_id │\
> │ │ price snap. │\
> │ │ quantity │\
> │ └──────┬───────┘\
> │ │1\
> │ ▼ N\
> │ ┌──────────────────┐\
> │ │ORDER_ITEM_OPTIONS│\
> │ └──────────────────┘\
> │\
> ├───────────────\> REVIEWS \<──────── PRODUCTS \<──────── CATEGORIES\
> │\
> └───────────────\> AUDIT_LOGS\
> \
> PRODUCTS 1────N PRODUCT_OPTIONS

# 4. Important Data Modeling Decision

OrderItem menyimpan product_name_snapshot dan unit_price_snapshot. OrderItemOptions juga menyimpan option_name_snapshot dan price_delta_snapshot. Dengan demikian histori order tetap konsisten walaupun admin kemudian mengubah nama atau harga produk.
