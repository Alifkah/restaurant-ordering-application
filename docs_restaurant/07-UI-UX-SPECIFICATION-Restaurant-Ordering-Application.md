**07 --- UI/UX SPECIFICATION**

Restaurant Ordering Application --- UI/UX & Screen Architecture\
Version 1.0 --- 18 August 2026

# 1. Scope

Dokumen ini menerjemahkan kebutuhan customer-facing, staff-facing, dan admin-facing pada PRD menjadi struktur screen dan component. PRD menyatakan desain UI/UX perlu diklarifikasi apakah disediakan klien atau dirancang developer; dokumen ini menjadi technical UI specification, bukan pengganti final visual design. fileciteturn0file0L57-L60

# 2. UX Principles

-   Mobile-first dan responsive.

-   Ordering flow sesingkat mungkin.

-   Status order mudah dipahami.

-   Kitchen interface fokus pada visibility dan speed.

-   Admin interface fokus pada information density dan control.

-   Loading, empty, error, dan success states harus didefinisikan.

-   Accessibility dasar: semantic HTML, keyboard navigation, readable contrast, form labels.

# 3. Information Architecture

> PUBLIC\
> ├── Home\
> ├── Menu\
> │ ├── Category\
> │ └── Product Detail\
> ├── About\
> └── Login / Register\
> \
> CUSTOMER\
> ├── Account\
> ├── Orders\
> │ └── Order Detail / Tracking\
> ├── Cart\
> └── Checkout\
> \
> STAFF\
> └── Kitchen Board\
> \
> ADMIN\
> ├── Dashboard\
> ├── Products\
> ├── Categories\
> ├── Orders\
> ├── Users\
> ├── Reports\
> ├── Audit Logs\
> └── Settings

# 4. Customer Screens

  ----------------------------------------------------------------------------------------------------
  Screen                  Core Components                                      Primary Action
  ----------------------- ---------------------------------------------------- -----------------------
  Home                    Hero, restaurant info, featured menu, CTA            Browse menu

  Menu                    Search, category filter, product cards               Open product

  Product Detail          Image, description, price, options, quantity         Add to cart

  Cart                    Items, options, quantity, subtotal                   Checkout

  Checkout                Order summary, customer/account state, payment CTA   Pay

  Order Tracking          Status timeline, order details                       Track order

  Order History           Order list/filter                                    Open order

  Review                  Rating, comment, product context                     Submit review

  Account                 Profile/session actions                              Manage account
  ----------------------------------------------------------------------------------------------------

# 5. Staff Kitchen Board

> ┌──────────┬────────────┬────────────┬────────────┐\
> │ PENDING │ CONFIRMED │ PREPARING │ READY │\
> ├──────────┼────────────┼────────────┼────────────┤\
> │ Order \# │ Order \# │ Order \# │ Order \# │\
> │ Items │ Items │ Items │ Items │\
> │ Time │ Time │ Time │ Time │\
> └──────────┴────────────┴────────────┴────────────┘

Order baru harus terlihat secara realtime. Staff dapat acknowledge dan memperbarui status sesuai state machine.

# 6. Admin Screens

  ----------------------------------------------------------------------------------------
  Screen                              Core Function
  ----------------------------------- ----------------------------------------------------
  Dashboard                           Operational overview and shortcuts

  Products                            CRUD products, price, availability, image, options

  Categories                          CRUD categories and ordering

  Orders                              Monitor/filter/manage all orders

  Users                               Customer/staff management

  Reports                             Operational insights

  Audit Logs                          Who changed what and when

  Settings                            Hours, location, restaurant operational settings
  ----------------------------------------------------------------------------------------

# 7. Design System Requirements

-   Centralize typography, spacing, radius, shadows, and component states.

-   Use reusable Button, Input, Select, Dialog, Toast, Card, Table, Badge, Tabs, Skeleton, EmptyState, ErrorState.

-   Dynamic Currency Formatter: Komponen UI untuk menampilkan harga secara konsisten mengikuti pengaturan mata uang restoran (simbol, jumlah desimal, pemisah ribuan).

-   Cloudinary Image Component: Komponen pembungkus gambar menu dengan lazy loading, automatic WebP/AVIF format optimization, dan responsif thumbnail transform.

-   Status colors must be consistent across customer tracking, kitchen, and admin.

-   Product imagery should preserve consistent aspect ratio (e.g. 4:3 atau 1:1).

-   Avoid duplicating page-specific UI primitives.

# 8. Responsive Breakpoints

> Mobile → primary ordering experience\
> Tablet → expanded menu/admin layouts\
> Desktop → full admin/kitchen information density

# 9. UX States

-   Loading

-   Empty

-   Error

-   Unauthorized

-   Not Found

-   Submitting

-   Payment Processing

-   Payment Failed

-   Order Created

-   Realtime Disconnected / Reconnecting

# 10. PWA Requirements

-   Installable application metadata.

-   Responsive mobile UI.

-   Offline-aware behavior sesuai kebutuhan; critical ordering/payment actions tetap membutuhkan network.

-   Reconnect strategy untuk kitchen realtime.

-   App shell/static assets dapat dicache secara aman.
